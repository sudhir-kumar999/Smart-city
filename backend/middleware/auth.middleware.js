const { verifyToken } = require('../utils/jwt.util');
const User = require('../models/User.model');

/**
 * Middleware to verify JWT access token
 * Attaches user to req.user if token is valid
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token not provided. Please login.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token'
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * @param {...String} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

/**
 * Middleware to check if 2FA is verified
 */
// const require2FA = (req, res, next) => {
//   if (!req.user.is2FAVerified) {
//     return res.status(403).json({
//       success: false,
//       message: 'Two-factor authentication required. Please verify OTP.'
//     });
//   }
//   next();
// };

module.exports = {
  authenticate,
  authorize,
  // require2FA
};

