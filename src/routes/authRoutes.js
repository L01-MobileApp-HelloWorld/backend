const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { refreshTokenRules, logoutRules } = require('../validators/authValidator');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', refreshTokenRules, validate, authController.refreshToken);
router.post('/logout', logoutRules, validate, authController.logout);
router.get('/profile', protect, authController.getProfile);

module.exports = router;
