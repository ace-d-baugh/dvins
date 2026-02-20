require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const parksRoutes = require('./routes/parks');
const attractionsRoutes = require('./routes/attractions');
const favoritesRoutes = require('./routes/favorites');
const { startPoller } = require('./services/poller');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', authRoutes);
app.use('/parks', parksRoutes);
app.use('/attractions', attractionsRoutes);
app.use('/favorites', favoritesRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'D'VINS Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`D'VINS Backend API running on port ${PORT}`);
});

// Start API poller
startPoller();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
