const express = require('express');
const storage = require('../services/storage');
const minio = require('../services/minio');

const router = express.Router();

// Contract Status Constants
const CONTRACT_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  PENDING_INTERNAL: 'pending_internal',
  INTERNAL_SIGNED: 'internal_signed',
  PENDING_SEND: 'pending_send',
  SENT: 'sent',
  PARTIALLY_SIGNED: 'partially_signed',
  COMPLETED: 'completed',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
};

// Get all contracts
router.get('/', async (req, res) => {
  try {
    let contracts = await storage.getContracts();

    // Filter by status if provided
    if (req.query.status) {
      const statuses = req.query.status.split(',');
      contracts = contracts.filter(c => statuses.includes(c.status));
    }

    // Filter by blueprintId if provided
    if (req.query.blueprintId) {
      contracts = contracts.filter(c => c.blueprintId === parseInt(req.query.blueprintId));
    }

    // Sort by most recent first
    contracts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contract by ID
router.get('/:id', async (req, res) => {
  try {
    const contract = await storage.getContractById(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create contract from template
router.post('/', async (req, res) => {
  try {
    const contractData = req.body;
    const contractId = Date.now();

    // Get the template to copy document reference
    if (contractData.blueprintId) {
      const template = await storage.getTemplateById(contractData.blueprintId);
      if (template) {
        // Increment template usage
        await storage.incrementTemplateUsage(contractData.blueprintId);

        // Determine initial status based on template settings
        let initialStatus = CONTRACT_STATUS.DRAFT;
        if (template.settings?.approval?.enabled) {
          initialStatus = CONTRACT_STATUS.PENDING_APPROVAL;
        }

        // Map signers from parties with their details
        const signers = (template.parties || []).map((party) => ({
          ...party,
          signerId: party.id,
          status: 'pending',
          signedAt: null,
          email: contractData.signerEmails?.[party.id] || '',
          name: contractData.signerNames?.[party.id] || party.name,
        }));

        // Map fields with their values from the form
        const fieldValues = contractData.fieldValues || {};
        const fields = (template.fields || []).map((field) => ({
          ...field,
          value: fieldValues[field.id] !== undefined ? fieldValues[field.id] : null,
          filledAt: fieldValues[field.id] !== undefined ? new Date().toISOString() : null,
        }));

        // Copy document to contract-specific location in MinIO
        let contractDocumentUrl = template.documentUrl;
        let contractThumbnailUrl = template.thumbnailUrl;

        if (template.documentUrl) {
          try {
            const newDocPath = `contracts/${contractId}/document${getFileExtension(template.fileName || template.documentUrl)}`;
            await minio.copyFile(template.documentUrl, newDocPath);
            contractDocumentUrl = newDocPath;
          } catch (copyError) {
            console.error('Error copying document to contract:', copyError);
            // Fall back to using the original document URL
          }
        }

        if (template.thumbnailUrl) {
          try {
            const newThumbPath = `contracts/${contractId}/thumbnail.png`;
            await minio.copyFile(template.thumbnailUrl, newThumbPath);
            contractThumbnailUrl = newThumbPath;
          } catch (copyError) {
            console.error('Error copying thumbnail to contract:', copyError);
            // Fall back to using the original thumbnail URL
          }
        }

        contractData.id = contractId;
        contractData.status = initialStatus;
        contractData.signers = signers;
        contractData.fields = fields;
        contractData.settings = template.settings || {};
        contractData.documentUrl = contractDocumentUrl;
        contractData.thumbnailUrl = contractThumbnailUrl;
        contractData.documentType = template.documentType;
        contractData.fileName = template.fileName;
        contractData.numPages = template.numPages || 1;
        contractData.blueprintName = template.name;
        contractData.blueprintVersion = template.version || '1.0';
        contractData.statusHistory = [
          {
            status: initialStatus,
            timestamp: new Date().toISOString(),
            actor: contractData.createdBy || 'System',
            note: 'Contract created',
          },
        ];
      }
    }

    const contract = await storage.saveContract(contractData);
    res.status(201).json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get file extension
function getFileExtension(filename) {
  if (!filename) return '.pdf';
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '.pdf';
}

// Update contract
router.put('/:id', async (req, res) => {
  try {
    const contract = await storage.updateContract(req.params.id, req.body);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contract status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actor = 'System', note = '' } = req.body;

    const contract = await storage.getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const historyEntry = {
      status,
      timestamp: new Date().toISOString(),
      actor,
      note,
    };

    const updated = await storage.updateContract(id, {
      status,
      statusHistory: [...(contract.statusHistory || []), historyEntry],
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update signer status
router.put('/:id/signers/:signerId', async (req, res) => {
  try {
    const { id, signerId } = req.params;
    const { status, signature } = req.body;

    const contract = await storage.getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const updatedSigners = contract.signers.map((signer) =>
      signer.signerId === signerId || signer.signerId === parseInt(signerId)
        ? {
            ...signer,
            status,
            signedAt: status === 'signed' ? new Date().toISOString() : signer.signedAt,
            signature: signature || signer.signature,
          }
        : signer
    );

    // Check if all signers of a type have signed
    const internalSigners = updatedSigners.filter((s) => s.signerType === 'internal');
    const externalSigners = updatedSigners.filter((s) => s.signerType === 'external');

    const allInternalSigned = internalSigners.length === 0 || internalSigners.every((s) => s.status === 'signed');
    const allExternalSigned = externalSigners.length === 0 || externalSigners.every((s) => s.status === 'signed');

    // Determine new contract status
    let newStatus = contract.status;
    if (allInternalSigned && !allExternalSigned) {
      newStatus = contract.settings?.internalFlow?.afterInternalSigning === 'auto_send'
        ? CONTRACT_STATUS.SENT
        : CONTRACT_STATUS.PENDING_SEND;
    } else if (allInternalSigned && allExternalSigned) {
      newStatus = CONTRACT_STATUS.COMPLETED;
    }

    const updated = await storage.updateContract(id, {
      signers: updatedSigners,
      status: newStatus,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send contract to external signers
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const { actor = 'System' } = req.body;

    const contract = await storage.getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (contract.status !== CONTRACT_STATUS.PENDING_SEND) {
      return res.status(400).json({ error: 'Contract is not ready to send' });
    }

    const historyEntry = {
      status: CONTRACT_STATUS.SENT,
      timestamp: new Date().toISOString(),
      actor,
      note: 'Sent to external signers',
    };

    const updated = await storage.updateContract(id, {
      status: CONTRACT_STATUS.SENT,
      statusHistory: [...(contract.statusHistory || []), historyEntry],
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke contract
router.post('/:id/revoke', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, actor = 'System' } = req.body;

    const contract = await storage.getContractById(id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const historyEntry = {
      status: CONTRACT_STATUS.REVOKED,
      timestamp: new Date().toISOString(),
      actor,
      note: reason || 'Contract revoked',
    };

    const updated = await storage.updateContract(id, {
      status: CONTRACT_STATUS.REVOKED,
      statusHistory: [...(contract.statusHistory || []), historyEntry],
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contract
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await storage.getContractById(id);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Delete any contract-specific files from MinIO
    try {
      await minio.deleteFilesWithPrefix(`contracts/${id}/`);
    } catch (e) {
      console.error('Error deleting contract files:', e);
    }

    await storage.deleteContract(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
