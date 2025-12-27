const express = require('express');
const cors = require('cors');
const { initBucket } = require('./services/minio');

// Import routes
const templatesRouter = require('./routes/templates');
const contractsRouter = require('./routes/contracts');
const documentsRouter = require('./routes/documents');
const analyticsRouter = require('./routes/analytics');
const dashboardRouter = require('./routes/dashboard');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const clientsRouter = require('./routes/clients');
const journeysRouter = require('./routes/journeys');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/templates', templatesRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/journeys', journeysRouter);

// Platform stats (alias for dashboard)
app.use('/api/platform-stats', (req, res, next) => {
  req.url = '/platform-stats';
  dashboardRouter(req, res, next);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Initialize and start server
async function start() {
  try {
    // Wait for MinIO to be ready (retry logic)
    let retries = 10;
    while (retries > 0) {
      try {
        await initBucket();
        break;
      } catch (error) {
        console.log(`Waiting for MinIO... (${retries} retries left)`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    if (retries === 0) {
      console.error('Failed to connect to MinIO after multiple retries');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
