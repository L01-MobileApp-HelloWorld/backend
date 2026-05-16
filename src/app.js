const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const { initSentry, setupSentryErrorHandler } = require('./config/sentry');

// Import routes
const authRoutes = require('./routes/authRoutes');
const historyRoutes = require('./routes/historyRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const questionRoutes = require('./routes/questionRoutes');
const { trackUserBehavior } = require('./middleware/analytics');


const app = express();

initSentry(app);              // SENTRY - đặt ĐẦU TIÊN


// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau'
  }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}



// Swagger Documentation
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use(trackUserBehavior);  // Track mọi request
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bận hay Lười? API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});


app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy route này'
  });
});

setupSentryErrorHandler(app); // SENTRY ERROR HANDLER - Đặt TRƯỚC errorHandler


// Error handler
app.use(errorHandler);

module.exports = app;