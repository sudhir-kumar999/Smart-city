const User = require('../models/User.model');
const OTP = require('../models/OTP.model');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.util');
const { sendVerificationEmail, sendOTPEmail } = require('../utils/email.util');
const { generateEmailVerificationToken, generateOTP } = require('../utils/generateToken.util');

/**
 * User Signup
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'citizen',
      emailVerificationToken,
      emailVerificationExpiry
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, emailVerificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail signup if email fails, but log it
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error during signup'
    });
  }
};

/**
 * Email Verification
 * GET /api/auth/verify-email?token=xxx
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error during email verification'
    });
  }
};

/**
 * User Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Please verify your email before logging in'
    //   });
    // }

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Generate OTP for 2FA
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    await OTP.create({
      userId: user._id,
      otp,
      expiresAt: otpExpiry
    });

    // Send OTP via email
    try {
      await sendOTPEmail(user.email, otp);
    } catch (emailError) {
      console.error('OTP email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Reset 2FA verification status
    user.is2FAVerified = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful. Please verify OTP sent to your email.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        requires2FA: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error during login'
    });
  }
};

/**
 * Verify OTP (2FA)
 * POST /api/auth/verify-otp
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      userId: user._id,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update user 2FA status
    user.is2FAVerified = true;
    user.is2FAEnabled = true;
    await user.save();

    // Generate access token
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);

    // Set access token in HTTP-only cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'None',
      secure:true,

      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken // Also send in response for frontend storage if needed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error during OTP verification'
    });
  }
};

/**
 * Refresh Access Token
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    const { verifyToken } = require('../utils/jwt.util');
    const decoded = verifyToken(refreshToken);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // Generate new access token
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    // Set new access token in HTTP-only cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure:true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

/**
 * User Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // If user is authenticated, reset 2FA status
    if (req.user) {
      req.user.is2FAVerified = false;
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error during logout'
    });
  }
};

/**
 * Get Current User
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user data'
    });
  }
};

module.exports = {
  signup,
  verifyEmail,
  login,
  verifyOTP,
  refreshToken,
  logout,
  getCurrentUser
};

