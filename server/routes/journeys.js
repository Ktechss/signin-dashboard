const express = require('express');
const storage = require('../services/storage');

const router = express.Router();

// Get all journeys
router.get('/', async (req, res) => {
  try {
    let journeys = await storage.getJourneys();

    // Filter by status if provided
    if (req.query.status) {
      const statuses = req.query.status.split(',');
      journeys = journeys.filter(j => statuses.includes(j.status));
    }

    // Filter by clientId if provided
    if (req.query.clientId) {
      journeys = journeys.filter(j => j.clientId === parseInt(req.query.clientId));
    }

    // Sort by most recent first
    journeys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(journeys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get journey by ID
router.get('/:id', async (req, res) => {
  try {
    const journey = await storage.getJourneyById(req.params.id);
    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }
    res.json(journey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create journey
router.post('/', async (req, res) => {
  try {
    const journey = await storage.saveJourney(req.body);
    res.status(201).json(journey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update journey
router.put('/:id', async (req, res) => {
  try {
    const journey = await storage.updateJourney(req.params.id, req.body);
    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }
    res.json(journey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete journey
router.delete('/:id', async (req, res) => {
  try {
    await storage.deleteJourney(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
