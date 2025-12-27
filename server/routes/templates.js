const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const storage = require('../services/storage');
const minio = require('../services/minio');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await storage.getTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await storage.getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create template with file upload
router.post('/', upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const templateData = JSON.parse(req.body.data || '{}');
    const documentFile = req.files?.document?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    // Generate a temporary ID for file paths
    const tempId = Date.now();

    // Upload document to MinIO
    let documentUrl = null;
    let documentType = null;
    if (documentFile) {
      const docPath = `templates/${tempId}/document${getExtension(documentFile.originalname)}`;
      await minio.uploadFile(docPath, documentFile.buffer, documentFile.mimetype);
      documentUrl = `/api/documents/${docPath}`;
      documentType = documentFile.mimetype;
    }

    // Upload thumbnail to MinIO
    let thumbnailUrl = null;
    if (thumbnailFile) {
      const thumbPath = `templates/${tempId}/thumbnail.png`;
      await minio.uploadFile(thumbPath, thumbnailFile.buffer, thumbnailFile.mimetype);
      thumbnailUrl = `/api/documents/${thumbPath}`;
    }

    // Save template metadata
    const template = await storage.saveTemplate({
      ...templateData,
      documentUrl,
      thumbnailUrl,
      documentType,
      fileName: documentFile?.originalname || templateData.fileName,
    });

    // Rename files to use actual ID
    if (documentUrl) {
      // Files are already saved with tempId which equals the actual id
    }

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update template
router.put('/:id', upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const templateData = req.body.data ? JSON.parse(req.body.data) : req.body;
    const documentFile = req.files?.document?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    // Extract version options from template data
    const { versionType, changeNote, createdBy, ...updates } = templateData;

    const existing = await storage.getTemplateById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Upload new document if provided
    if (documentFile) {
      // Delete old document
      if (existing.documentUrl) {
        const oldPath = existing.documentUrl.replace('/api/documents/', '');
        try {
          await minio.deleteFile(oldPath);
        } catch (e) { /* ignore */ }
      }

      const docPath = `templates/${id}/document${getExtension(documentFile.originalname)}`;
      await minio.uploadFile(docPath, documentFile.buffer, documentFile.mimetype);
      updates.documentUrl = `/api/documents/${docPath}`;
      updates.documentType = documentFile.mimetype;
      updates.fileName = documentFile.originalname;
    }

    // Upload new thumbnail if provided
    if (thumbnailFile) {
      if (existing.thumbnailUrl) {
        const oldPath = existing.thumbnailUrl.replace('/api/documents/', '');
        try {
          await minio.deleteFile(oldPath);
        } catch (e) { /* ignore */ }
      }

      const thumbPath = `templates/${id}/thumbnail.png`;
      await minio.uploadFile(thumbPath, thumbnailFile.buffer, thumbnailFile.mimetype);
      updates.thumbnailUrl = `/api/documents/${thumbPath}`;
    }

    // Build version options if version type provided
    const versionOptions = versionType ? { versionType, changeNote, createdBy } : null;

    const template = await storage.updateTemplate(id, updates, versionOptions);
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get version history for a template
router.get('/:id/versions', async (req, res) => {
  try {
    const versions = await storage.getVersionHistory(req.params.id);
    if (versions === null) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific version snapshot
router.get('/:id/versions/:version', async (req, res) => {
  try {
    const snapshot = await storage.getVersionSnapshot(req.params.id, req.params.version);
    if (snapshot === null) {
      return res.status(404).json({ error: 'Version not found' });
    }
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore template to a specific version
router.post('/:id/restore/:version', async (req, res) => {
  try {
    const { createdBy } = req.body;
    const template = await storage.restoreVersion(req.params.id, req.params.version, createdBy);
    if (!template) {
      return res.status(404).json({ error: 'Template or version not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Error restoring version:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete template
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await storage.getTemplateById(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Delete files from MinIO
    try {
      await minio.deleteFilesWithPrefix(`templates/${id}/`);
    } catch (e) {
      console.error('Error deleting template files:', e);
    }

    // Delete from storage
    await storage.deleteTemplate(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment usage count
router.post('/:id/increment-usage', async (req, res) => {
  try {
    const template = await storage.incrementTemplateUsage(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get file extension
function getExtension(filename) {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
}

module.exports = router;
