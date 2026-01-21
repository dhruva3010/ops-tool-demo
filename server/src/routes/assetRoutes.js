const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  unassignAsset,
  addMaintenance,
  getQRCode,
  getAssetStats,
} = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { requireRole, requireMinRole } = require('../middleware/rbac');
const { assetValidation, mongoIdParam } = require('../middleware/validate');

// All routes require authentication
router.use(protect);

// Stats - admin/manager only
router.get('/stats', requireMinRole('manager'), getAssetStats);

// CRUD operations
router.get('/', getAssets);
router.post('/', requireMinRole('manager'), assetValidation.create, createAsset);
router.get('/:id', mongoIdParam(), getAsset);
router.put('/:id', mongoIdParam(), requireMinRole('manager'), assetValidation.update, updateAsset);
router.delete('/:id', mongoIdParam(), requireMinRole('manager'), deleteAsset);

// Assignment
router.post('/:id/assign', mongoIdParam(), requireMinRole('manager'), assetValidation.assign, assignAsset);
router.post('/:id/unassign', mongoIdParam(), requireMinRole('manager'), unassignAsset);

// Maintenance
router.post('/:id/maintenance', mongoIdParam(), requireMinRole('manager'), assetValidation.maintenance, addMaintenance);

// QR Code
router.get('/:id/qr', mongoIdParam(), getQRCode);

module.exports = router;
