const express = require('express');
const passport = require('passport');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  googleCallback,
  microsoftCallback,
} = require('../controllers/authController');
const { protect, verifyRefreshToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { userValidation } = require('../middleware/validate');

// Local auth
router.post('/register', protect, requireRole('admin'), userValidation.register, register);
router.post('/login', userValidation.login, login);
router.post('/refresh', verifyRefreshToken, refreshToken);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get('/google/callback', googleCallback);

// Microsoft OAuth
router.get(
  '/microsoft',
  passport.authenticate('microsoft', { scope: ['user.read'], session: false })
);
router.get('/microsoft/callback', microsoftCallback);

module.exports = router;
