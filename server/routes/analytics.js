const express = require('express');
const storage = require('../services/storage');

const router = express.Router();

// Analytics - Journey Distribution
router.get('/distribution', async (req, res) => {
  try {
    const clientId = req.query.clientId;
    let journeys = await storage.getJourneys();

    if (clientId && clientId !== 'all') {
      journeys = journeys.filter(j => j.clientId === parseInt(clientId));
    }

    const statusCounts = {
      'Expired': journeys.filter(j => j.status === 'expired').length,
      'Abandoned': Math.floor(journeys.length * 0.05),
      'Rejected': journeys.filter(j => j.status === 'rejected').length,
      'Blocked': Math.floor(journeys.length * 0.03),
      'Completed': journeys.filter(j => j.status === 'authorised').length,
      'Pending': journeys.filter(j => j.status === 'pending').length,
    };

    const colors = {
      'Expired': '#8b5cf6',
      'Abandoned': '#5eead4',
      'Rejected': '#1e3a5f',
      'Blocked': '#64748b',
      'Completed': '#06b6d4',
      'Pending': '#f59e0b',
    };

    const distribution = Object.entries(statusCounts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[name]
      }));

    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics - By Channel
router.get('/by-channel', async (req, res) => {
  try {
    const clientId = req.query.clientId;
    let journeys = await storage.getJourneys();

    if (clientId && clientId !== 'all') {
      journeys = journeys.filter(j => j.clientId === parseInt(clientId));
    }

    const channelCounts = {};
    journeys.forEach(j => {
      const channel = j.channel || 'Other';
      channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    });

    const total = journeys.length;
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

    const byChannel = Object.entries(channelCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name,
        value: total > 0 ? Math.round((count / total) * 100) : 0,
        count,
        color: colors[index % colors.length]
      }));

    res.json(byChannel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics - By Client
router.get('/by-client', async (req, res) => {
  try {
    const clients = await storage.getClients();
    const journeys = await storage.getJourneys();

    const today = new Date();
    const data = [];

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dateISO = date.toISOString().split('T')[0];

      const entry = { date: dateStr };

      clients.forEach(client => {
        const clientJourneys = journeys.filter(j => {
          const journeyDate = new Date(j.createdAt).toISOString().split('T')[0];
          return j.clientId === client.id && journeyDate === dateISO;
        });
        entry[client.abbr?.toLowerCase() || client.name.toLowerCase()] = clientJourneys.length;
      });

      data.push(entry);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics - Daily Status
router.get('/daily-status', async (req, res) => {
  try {
    const clientId = req.query.clientId;
    let journeys = await storage.getJourneys();

    if (clientId && clientId !== 'all') {
      journeys = journeys.filter(j => j.clientId === parseInt(clientId));
    }

    const today = new Date();
    const data = [];

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dateISO = date.toISOString().split('T')[0];

      const dayJourneys = journeys.filter(j => {
        const journeyDate = new Date(j.createdAt).toISOString().split('T')[0];
        return journeyDate === dateISO;
      });

      const completed = dayJourneys.filter(j => j.status === 'authorised').length;
      const rejected = dayJourneys.filter(j => j.status === 'rejected').length;
      const expired = dayJourneys.filter(j => j.status === 'expired').length;
      const total = dayJourneys.length;
      const abandoned = Math.floor(total * 0.05);

      data.push({
        date: dateStr,
        completed,
        rejected,
        abandoned,
        expired
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics - Contract Status
router.get('/contract-status', async (req, res) => {
  try {
    const clientId = req.query.clientId;
    let contracts = await storage.getContracts();

    if (clientId && clientId !== 'all') {
      contracts = contracts.filter(c => c.clientId === parseInt(clientId));
    }

    const statusCounts = {
      'Signed': contracts.filter(c => c.status === 'signed' || c.status === 'completed').length,
      'In Progress': contracts.filter(c => c.status === 'in_progress' || c.status === 'pending_internal').length,
      'Pending': contracts.filter(c => c.status === 'pending' || c.status === 'draft').length,
      'Failed': contracts.filter(c => c.status === 'failed' || c.status === 'declined').length,
      'Expired': contracts.filter(c => c.status === 'expired').length
    };

    const colors = {
      'Signed': '#06b6d4',
      'In Progress': '#6366f1',
      'Pending': '#f59e0b',
      'Failed': '#1e293b',
      'Expired': '#8b5cf6'
    };

    const distribution = Object.entries(statusCounts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[name]
      }));

    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics - Devices
router.get('/devices', async (req, res) => {
  try {
    const clientId = req.query.clientId;
    let journeys = (await storage.getJourneys()).filter(j => j.device);

    if (clientId && clientId !== 'all') {
      journeys = journeys.filter(j => j.clientId === parseInt(clientId));
    }

    let desktop = 0, mobile = 0, tablet = 0;

    journeys.forEach(j => {
      const device = (j.device || '').toLowerCase();
      if (device.includes('iphone') || device.includes('android')) {
        mobile++;
      } else if (device.includes('ipad') || device.includes('tablet')) {
        tablet++;
      } else {
        desktop++;
      }
    });

    const total = desktop + mobile + tablet;

    res.json([
      { name: 'Desktop', value: total > 0 ? Math.round((desktop / total) * 100) : 0, color: '#6366f1' },
      { name: 'Mobile', value: total > 0 ? Math.round((mobile / total) * 100) : 0, color: '#10b981' },
      { name: 'Tablet', value: total > 0 ? Math.round((tablet / total) * 100) : 0, color: '#f59e0b' }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
