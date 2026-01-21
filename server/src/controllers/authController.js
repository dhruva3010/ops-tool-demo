const passport = require('passport');
const User = require('../models/User');
const { generateTokens } = require('../middleware/auth');

// @desc    Register new user (admin only)
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, password, name, role, department } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role: role || 'employee',
      department,
      authProvider: 'local',
    });

    const tokens = generateTokens(user._id);

    res.status(201).json({
      user: user.toJSON(),
      ...tokens,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error' });
    }

    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    }

    const tokens = generateTokens(user._id);

    res.json({
      user: user.toJSON(),
      ...tokens,
    });
  })(req, res, next);
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
const refreshToken = async (req, res) => {
  const tokens = generateTokens(req.user._id);

  res.json({
    ...tokens,
    user: req.user.toJSON(),
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user.toJSON() });
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  // With JWT, logout is handled client-side by removing tokens
  // Server can blacklist tokens if needed
  res.json({ message: 'Logged out successfully' });
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const tokens = generateTokens(user._id);

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.CLIENT_URL}/oauth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
    );
  })(req, res, next);
};

// @desc    Microsoft OAuth callback
// @route   GET /api/auth/microsoft/callback
const microsoftCallback = (req, res, next) => {
  passport.authenticate('microsoft', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const tokens = generateTokens(user._id);

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.CLIENT_URL}/oauth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
    );
  })(req, res, next);
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  googleCallback,
  microsoftCallback,
};
