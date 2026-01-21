const express = require('express');
const router = express.Router();
const {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  addContract,
  updateContract,
  deleteContract,
  getVendorStats,
} = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');
const { requireRole, requireMinRole } = require('../middleware/rbac');
const { vendorValidation, mongoIdParam } = require('../middleware/validate');

// All routes require authentication
router.use(protect);

// Only admin and manager can access vendors
router.use(requireMinRole('manager'));

// Stats
router.get('/stats', requireRole('admin'), getVendorStats);

// CRUD operations
router.get('/', getVendors);
router.post('/', requireRole('admin'), vendorValidation.create, createVendor);
router.get('/:id', mongoIdParam(), getVendor);
router.put('/:id', mongoIdParam(), requireRole('admin'), vendorValidation.update, updateVendor);
router.delete('/:id', mongoIdParam(), requireRole('admin'), deleteVendor);

// Contract management
router.post('/:id/contracts', mongoIdParam(), requireRole('admin'), vendorValidation.contract, addContract);
router.put('/:id/contracts/:contractId', mongoIdParam(), requireRole('admin'), updateContract);
router.delete('/:id/contracts/:contractId', mongoIdParam(), requireRole('admin'), deleteContract);

module.exports = router;
