const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/submit', historyController.submitQuiz);
router.get('/', historyController.getHistory);
router.get('/:id', historyController.getHistoryById);
router.delete('/:id', historyController.deleteHistory);

module.exports = router;