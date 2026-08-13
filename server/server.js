const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase, query } = require('./config/db');
const therapistRoutes = require('./routes/therapistRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const activityRoutes = require('./routes/activityRoutes');
const aiService = require('./services/aiService');
const { errorHandler, AppError } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend connectivity
app.use(cors());

// Enable JSON Parsing for request bodies
app.use(express.json());

// Mount API Routes
app.use('/api/therapists', therapistRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/activities', activityRoutes);


/**
 * Placeholder route for AI Summary Generation
 * POST /api/generate-summary/:therapistId
 */
app.post('/api/generate-summary/:therapistId', async (req, res, next) => {
  try {
    const { therapistId } = req.params;
    const result = await aiService.generateSummary(therapistId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Capture all undefined paths
app.use('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Centralized error handling middleware
app.use(errorHandler);

// Initialize DB pool and listen on port
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server started successfully on port ${PORT}`);
    });
  } catch (error) {
    console.error('Critical database initialization error. Server shutting down.');
    process.exit(1);
  }
}

startServer();

// Nodemon reload trigger to read updated .env variables

