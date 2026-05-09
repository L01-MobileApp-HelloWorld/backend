const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', feedbackController.submitFeedback);
router.get('/stats', feedbackController.getFeedbackStats);

module.exports = router;