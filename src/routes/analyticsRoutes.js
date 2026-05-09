const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/sessions', analyticsController.getSessionAnalytics);

module.exports = router;