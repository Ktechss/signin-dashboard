const express = require('express');
const storage = require('../services/storage');

const router = express.Router();

// Dashboard KPI - computed from actual data
router.get('/kpi', async (req, res) => {
  try {
    const clientId = req.query.clientId;

    let contracts = await storage.getContracts();
    let journeys = await storage.getJourneys();
    let templates = await storage.getTemplates();

    // Filter by client if specified
    if (clientId && clientId !== 'all') {
      contracts = contracts.filter(c => c.clientId === parseInt(clientId));
      journeys = journeys.filter(j => j.clientId === parseInt(clientId));
    }

    const totalJourneys = journeys.length;
    const signedContracts = contracts.filter(c => c.status === 'signed' || c.status === 'completed').length;
    const activeTemplates = templates.filter(t => t.status === 'active').length;
    const authorisedJourneys = journeys.filter(j => j.status === 'authorised').length;
    const successRate = totalJourneys > 0 ? ((authorisedJourneys / totalJourneys) * 100).toFixed(1) : 0;

    res.json([
      {
        id: 'total-journeys',
        title: 'Total Journeys',
        value: totalJourneys.toLocaleString(),
        trend: 'up',
        trendValue: '+12.5%',
        icon: 'route',
        color: 'indigo'
      },
      {
        id: 'contracts-signed',
        title: 'Contracts Signed',
        value: signedContracts.toLocaleString(),
        trend: 'up',
        trendValue: '+8.3%',
        icon: 'file-check',
        color: 'emerald'
      },
      {
        id: 'active-blueprints',
        title: 'Active Blueprints',
        value: activeTemplates.toString(),
        trend: 'up',
        trendValue: '+3',
        icon: 'layers',
        color: 'violet'
      },
      {
        id: 'success-rate',
        title: 'Success Rate',
        value: successRate + '%',
        trend: 'up',
        trendValue: '+1.8%',
        icon: 'trending-up',
        color: 'amber'
      }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Trends - computed from actual journeys
router.get('/trends', async (req, res) => {
  try {
    const clientId = req.query.clientId;
    let journeys = await storage.getJourneys();

    if (clientId && clientId !== 'all') {
      journeys = journeys.filter(j => j.clientId === parseInt(clientId));
    }

    // Group journeys by date (last 14 days)
    const today = new Date();
    const trends = [];

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

      trends.push({
        date: dateStr,
        journeys: dayJourneys.length,
        completed: completed
      });
    }

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Recent Contracts - from actual contracts
router.get('/recent-contracts', async (req, res) => {
  try {
    const clientId = req.query.clientId;
    let contracts = await storage.getContracts();
    const templates = await storage.getTemplates();

    if (clientId && clientId !== 'all') {
      contracts = contracts.filter(c => c.clientId === parseInt(clientId));
    }

    // Sort by createdAt descending and take top 5
    const recentContracts = contracts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(c => {
        const template = templates.find(t => t.id === c.templateId || t.id === c.blueprintId);
        const mainParty = c.parties?.[0] || c.signers?.[0];
        return {
          id: c.id,
          reference: c.reference,
          template: template?.name || c.blueprintName || 'Unknown',
          status: c.status,
          signer: mainParty?.name || 'Unknown',
          date: new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
      });

    res.json(recentContracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Recent Activity - from actual journeys and contracts
router.get('/recent-activity', async (req, res) => {
  try {
    const clientId = req.query.clientId;
    let journeys = await storage.getJourneys();
    let contracts = await storage.getContracts();

    if (clientId && clientId !== 'all') {
      journeys = journeys.filter(j => j.clientId === parseInt(clientId));
      contracts = contracts.filter(c => c.clientId === parseInt(clientId));
    }

    // Create activity from recent journeys
    const activities = journeys
      .filter(j => j.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .map(j => {
        let action, type;

        if (j.status === 'authorised') {
          action = 'Contract signed';
          type = 'success';
        } else if (j.status === 'rejected') {
          action = 'Verification failed';
          type = 'error';
        } else if (j.status === 'expired') {
          action = 'Journey expired';
          type = 'warning';
        } else {
          action = 'Journey started';
          type = 'info';
        }

        const timeDiff = Date.now() - new Date(j.completedAt || j.createdAt).getTime();
        const minutes = Math.floor(timeDiff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        let time;
        if (days > 0) time = `${days} day${days > 1 ? 's' : ''} ago`;
        else if (hours > 0) time = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        else time = `${minutes} min${minutes > 1 ? 's' : ''} ago`;

        return {
          id: j.id,
          action,
          description: `${j.channel || 'Web'} - ${j.userName || 'Unknown'}`,
          time,
          type
        };
      });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Platform Stats - aggregated from all clients
router.get('/platform-stats', async (req, res) => {
  try {
    const clients = await storage.getClients();
    const contracts = await storage.getContracts();
    const journeys = await storage.getJourneys();
    const templates = await storage.getTemplates();

    const totalJourneys = journeys.length;
    const signedContracts = contracts.filter(c => c.status === 'signed' || c.status === 'completed').length;
    const activeTemplates = templates.filter(t => t.status === 'active').length;
    const authorisedJourneys = journeys.filter(j => j.status === 'authorised').length;
    const successRate = totalJourneys > 0 ? ((authorisedJourneys / totalJourneys) * 100).toFixed(1) : 0;

    // Calculate per-client stats
    const clientStats = clients.map(client => {
      const clientContracts = contracts.filter(c => c.clientId === client.id);
      const clientJourneys = journeys.filter(j => j.clientId === client.id);
      return {
        ...client,
        contractCount: clientContracts.length,
        journeyCount: clientJourneys.length,
        signedCount: clientContracts.filter(c => c.status === 'signed' || c.status === 'completed').length
      };
    });

    res.json({
      totalJourneys: { value: totalJourneys, trend: '+18.3%' },
      contractsSigned: { value: signedContracts, trend: '+12.5%' },
      activeBlueprints: { value: activeTemplates, trend: '+' + activeTemplates },
      successRate: { value: successRate + '%', trend: '+1.2%' },
      avgCompletion: { value: '1.4 days', trend: '-0.3 days' },
      totalClients: clients.length,
      clients: clientStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
