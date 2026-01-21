const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserStats,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { userValidation, mongoIdParam } = require('../middleware/validate');

// All routes require authentication
router.use(protect);

// Stats - admin only
router.get('/stats', requireRole('admin'), getUserStats);

// List users
router.get('/', getUsers);

// Single user operations
router.get('/:id', mongoIdParam(), getUser);
router.put('/:id', mongoIdParam(), userValidation.update, updateUser);
router.put('/:id/role', mongoIdParam(), requireRole('admin'), userValidation.updateRole, updateUserRole);
router.delete('/:id', mongoIdParam(), requireRole('admin'), deleteUser);

module.exports = router;
