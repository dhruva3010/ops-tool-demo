const express = require('express');
const router = express.Router();
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getInstances,
  getInstance,
  createInstance,
  updateTask,
  cancelInstance,
  getOnboardingStats,
} = require('../controllers/onboardingController');
const { protect } = require('../middleware/auth');
const { requireRole, requireMinRole } = require('../middleware/rbac');
const { onboardingValidation, mongoIdParam } = require('../middleware/validate');

// All routes require authentication
router.use(protect);

// Stats
router.get('/stats', requireMinRole('manager'), getOnboardingStats);

// Templates
router.get('/templates', getTemplates);
router.get('/templates/:id', mongoIdParam(), getTemplate);
router.post('/templates', requireRole('admin'), onboardingValidation.createTemplate, createTemplate);
router.put('/templates/:id', mongoIdParam(), requireRole('admin'), onboardingValidation.updateTemplate, updateTemplate);
router.delete('/templates/:id', mongoIdParam(), requireRole('admin'), deleteTemplate);

// Instances
router.get('/instances', getInstances);
router.get('/instances/:id', mongoIdParam(), getInstance);
router.post('/instances', requireMinRole('manager'), onboardingValidation.createInstance, createInstance);
router.put('/instances/:id/tasks/:taskId', mongoIdParam(), onboardingValidation.updateTask, updateTask);
router.put('/instances/:id/cancel', mongoIdParam(), requireMinRole('manager'), cancelInstance);

module.exports = router;
