const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { getHistoryRules } = require('../validators/historyValidator');

router.use(protect);

router.post('/submit', historyController.submitQuiz);
router.post('/analyze', protect, historyController.submitQuiz);
router.get('/', getHistoryRules, validate, historyController.getHistory);
router.get('/:id', historyController.getHistoryById);
router.delete('/:id', historyController.deleteHistory);

module.exports = router;
