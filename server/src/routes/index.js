const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const assetRoutes = require('./assetRoutes');
const vendorRoutes = require('./vendorRoutes');
const onboardingRoutes = require('./onboardingRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/assets', assetRoutes);
router.use('/vendors', vendorRoutes);
router.use('/onboarding', onboardingRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
