// Role hierarchy: admin > manager > employee
const roleHierarchy = {
  admin: 3,
  manager: 2,
  employee: 1,
};

// Check if user has minimum required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Check if user has minimum role level
const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userLevel = roleHierarchy[req.user.role] || 0;
    const requiredLevel = roleHierarchy[minRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.',
        required: minRole,
        current: req.user.role
      });
    }

    next();
  };
};

// Resource access control based on ownership or role
const canAccessResource = (options = {}) => {
  const { ownerField = 'createdBy', allowRoles = ['admin'], allowSelf = false } = options;

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Admins can access everything
    if (allowRoles.includes(req.user.role)) {
      return next();
    }

    // Check if resource exists in request (set by previous middleware)
    if (req.resource) {
      const ownerId = req.resource[ownerField];

      // Check ownership
      if (ownerId && ownerId.toString() === req.user._id.toString()) {
        return next();
      }

      // For assigned resources (like assets assigned to user)
      if (allowSelf && req.resource.assignedTo) {
        if (req.resource.assignedTo.toString() === req.user._id.toString()) {
          return next();
        }
      }
    }

    return res.status(403).json({ message: 'Access denied. You do not have permission to access this resource.' });
  };
};

// Permission matrix for different resources
const permissions = {
  users: {
    admin: ['create', 'read', 'update', 'delete'],
    manager: ['read'],
    employee: ['read:self', 'update:self'],
  },
  assets: {
    admin: ['create', 'read', 'update', 'delete', 'assign'],
    manager: ['create', 'read', 'update', 'delete', 'assign:team'],
    employee: ['read:assigned'],
  },
  vendors: {
    admin: ['create', 'read', 'update', 'delete'],
    manager: ['read'],
    employee: [],
  },
  onboardingTemplates: {
    admin: ['create', 'read', 'update', 'delete'],
    manager: ['read'],
    employee: ['read:own'],
  },
  onboardingInstances: {
    admin: ['create', 'read', 'update', 'delete'],
    manager: ['create', 'read:team', 'update:team'],
    employee: ['read:own', 'update:own-tasks'],
  },
};

// Check specific permission
const hasPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userPermissions = permissions[resource]?.[req.user.role] || [];

    if (userPermissions.includes(action) || userPermissions.includes('*')) {
      return next();
    }

    // Check for partial permissions (like read:self)
    const partialPermission = userPermissions.find(p => p.startsWith(action + ':'));
    if (partialPermission) {
      req.permissionScope = partialPermission.split(':')[1];
      return next();
    }

    return res.status(403).json({
      message: 'Access denied. Insufficient permissions.',
      resource,
      action,
      role: req.user.role
    });
  };
};

module.exports = {
  requireRole,
  requireMinRole,
  canAccessResource,
  hasPermission,
  permissions,
  roleHierarchy,
};
