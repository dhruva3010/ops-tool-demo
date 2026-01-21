const { validationResult, body, param, query } = require('express-validator');

// Handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').optional().isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
    body('department').optional().trim(),
    handleValidation,
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidation,
  ],
  update: [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('role').optional().isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
    body('department').optional().trim(),
    body('isActive').optional().isBoolean(),
    handleValidation,
  ],
};

// Asset validation rules
const assetValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Asset name is required'),
    body('category').isIn(['hardware', 'software', 'furniture', 'vehicle', 'other']).withMessage('Invalid category'),
    body('serialNumber').optional().trim(),
    body('status').optional().isIn(['available', 'in-use', 'maintenance', 'retired']),
    body('location').optional().trim(),
    body('purchaseDate').optional().isISO8601().toDate(),
    body('purchasePrice').optional().isNumeric(),
    body('warrantyExpiry').optional().isISO8601().toDate(),
    body('depreciationRate').optional().isFloat({ min: 0, max: 100 }),
    handleValidation,
  ],
  update: [
    body('name').optional().trim().notEmpty(),
    body('category').optional().isIn(['hardware', 'software', 'furniture', 'vehicle', 'other']),
    body('status').optional().isIn(['available', 'in-use', 'maintenance', 'retired']),
    body('location').optional().trim(),
    body('purchaseDate').optional().isISO8601().toDate(),
    body('purchasePrice').optional().isNumeric(),
    body('warrantyExpiry').optional().isISO8601().toDate(),
    body('depreciationRate').optional().isFloat({ min: 0, max: 100 }),
    handleValidation,
  ],
  assign: [
    body('userId').notEmpty().isMongoId().withMessage('Valid user ID is required'),
    handleValidation,
  ],
  maintenance: [
    body('date').isISO8601().toDate().withMessage('Valid date is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('cost').optional().isNumeric(),
    body('performedBy').optional().trim(),
    handleValidation,
  ],
};

// Vendor validation rules
const vendorValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Vendor name is required'),
    body('category').optional().trim(),
    body('contacts').optional().isArray(),
    body('contacts.*.name').optional().notEmpty().withMessage('Contact name is required'),
    body('contacts.*.email').optional().isEmail().withMessage('Valid email required'),
    body('address').optional().trim(),
    body('website').optional().isURL().withMessage('Valid URL required'),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    handleValidation,
  ],
  update: [
    body('name').optional().trim().notEmpty(),
    body('category').optional().trim(),
    body('contacts').optional().isArray(),
    body('address').optional().trim(),
    body('website').optional().isURL(),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('isActive').optional().isBoolean(),
    handleValidation,
  ],
  contract: [
    body('title').trim().notEmpty().withMessage('Contract title is required'),
    body('startDate').isISO8601().toDate().withMessage('Valid start date required'),
    body('endDate').isISO8601().toDate().withMessage('Valid end date required'),
    body('value').optional().isNumeric(),
    handleValidation,
  ],
};

// Onboarding validation rules
const onboardingValidation = {
  createTemplate: [
    body('name').trim().notEmpty().withMessage('Template name is required'),
    body('department').optional().trim(),
    body('role').optional().trim(),
    body('tasks').isArray({ min: 1 }).withMessage('At least one task is required'),
    body('tasks.*.title').notEmpty().withMessage('Task title is required'),
    body('tasks.*.dueInDays').isInt({ min: 1 }).withMessage('Due in days must be positive'),
    body('tasks.*.assigneeRole').optional().isIn(['employee', 'manager', 'hr']),
    handleValidation,
  ],
  updateTemplate: [
    body('name').optional().trim().notEmpty(),
    body('department').optional().trim(),
    body('role').optional().trim(),
    body('tasks').optional().isArray(),
    body('isActive').optional().isBoolean(),
    handleValidation,
  ],
  createInstance: [
    body('employeeId').isMongoId().withMessage('Valid employee ID required'),
    body('templateId').isMongoId().withMessage('Valid template ID required'),
    body('startDate').optional().isISO8601().toDate(),
    handleValidation,
  ],
  updateTask: [
    body('status').isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
    body('notes').optional().trim(),
    handleValidation,
  ],
};

// Common validation helpers
const mongoIdParam = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  handleValidation,
];

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sort').optional().trim(),
  handleValidation,
];

module.exports = {
  handleValidation,
  userValidation,
  assetValidation,
  vendorValidation,
  onboardingValidation,
  mongoIdParam,
  paginationQuery,
};
