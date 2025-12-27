const express = require('express');
const storage = require('../services/storage');

const router = express.Router();

// Get all clients with computed stats
router.get('/', async (req, res) => {
  try {
    const clients = await storage.getClients();
    const contracts = await storage.getContracts();
    const journeys = await storage.getJourneys();
    const users = await storage.getUsers();

    const clientsWithStats = clients.map(client => {
      const clientContracts = contracts.filter(c => c.clientId === client.id);
      const clientJourneys = journeys.filter(j => j.clientId === client.id);
      const clientUsers = users.filter(u => u.clientId === client.id);

      return {
        ...client,
        contractCount: clientContracts.length,
        journeyCount: clientJourneys.length,
        userCount: clientUsers.length,
        signedContracts: clientContracts.filter(c => c.status === 'signed' || c.status === 'completed').length,
        authorisedJourneys: clientJourneys.filter(j => j.status === 'authorised').length
      };
    });

    res.json(clientsWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await storage.getClientById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create client
router.post('/', async (req, res) => {
  try {
    const client = await storage.saveClient(req.body);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const client = await storage.updateClient(req.params.id, req.body);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    await storage.deleteClient(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
