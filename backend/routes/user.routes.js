const express = require('express');
const router = express.Router();
const { authenticate, authorize, require2FA } = require('../middleware/auth.middleware');

// Placeholder for future user management routes
// Example: Get all users (admin only), update user profile, etc.

router.get('/profile', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

module.exports = router;

