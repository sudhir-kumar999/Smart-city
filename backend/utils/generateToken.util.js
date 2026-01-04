const crypto = require('crypto');

/**
 * Generate random token for email verification
 * @returns {String} Random token
 */
const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate 6-digit OTP
 * @returns {String} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  generateEmailVerificationToken,
  generateOTP
};

