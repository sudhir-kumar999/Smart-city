const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send Email Verification Link
 * @param {String} email - Recipient email
 * @param {String} token - Verification token
 * @returns {Promise}
 */
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `https://smart-cityf-ic5p.onrender.com/api/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"Smart City Management" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for registering with Smart City Management System!</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this URL into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send OTP for 2FA
 * @param {String} email - Recipient email
 * @param {String} otp - 6-digit OTP
 * @returns {Promise}
 */
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Smart City Management" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Your Two-Factor Authentication Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Two-Factor Authentication</h2>
        <p>Your OTP code for login verification is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; text-align: center; margin: 30px 0;">
          ${otp}
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendOTPEmail
};

