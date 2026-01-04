const jwt = require('jsonwebtoken');

/**
 * Generate JWT Access Token (short expiry - 15 minutes)
 * @param {Object} payload - User data to encode
 * @returns {String} JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
    }
  );
};

/**
 * Generate JWT Refresh Token (long expiry - 7 days)
 * @param {Object} payload - User data to encode
 * @returns {String} JWT token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d'
    }
  );
};

/**
 * Verify JWT Token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};

