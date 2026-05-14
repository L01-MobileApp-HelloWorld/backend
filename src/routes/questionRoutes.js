const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

// Lấy danh sách câu hỏi (cần đăng nhập)
router.get('/', protect, questionController.getQuestions);

// Seed câu hỏi mặc định (chỉ dùng 1 lần để tạo data)
router.post('/seed', protect, questionController.seedQuestions);

module.exports = router;