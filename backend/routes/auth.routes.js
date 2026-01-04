const express = require('express');
const router = express.Router();
const {
  signup,
  verifyEmail,
  login,
  verifyOTP,
  refreshToken,
  logout,
  getCurrentUser
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.post('/signup', signup);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

module.exports = router;

