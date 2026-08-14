const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase, query, dbConfig, dbName } = require('./config/db');
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

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

// Enable JSON Parsing for request bodies
app.use(express.json());

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Database debugging endpoint for production verification
app.get('/api/debug/database', async (req, res, next) => {
  try {
    const dbNameResult = await query('SELECT DATABASE() as dbName');
    const resolvedDbName = dbNameResult[0]?.dbName || 'unknown';

    const tablesResult = await query('SHOW TABLES');
    const tables = tablesResult.map(row => Object.values(row)[0]);

    let therapistCount = 0;
    try {
      const countRes = await query('SELECT COUNT(*) as count FROM therapists');
      therapistCount = countRes[0]?.count || 0;
    } catch (err) {
      therapistCount = 'Error reading therapists table: ' + err.message;
    }

    res.status(200).json({
      success: true,
      database: dbName,
      resolvedDatabase: resolvedDbName,
      host: dbConfig.host,
      user: dbConfig.user,
      tables,
      therapistCount
    });
  } catch (error) {
    next(error);
  }
});

// Health check route for Render deployment
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Therapy Appointment Summary System API is running",
    status: "healthy"
  });
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

