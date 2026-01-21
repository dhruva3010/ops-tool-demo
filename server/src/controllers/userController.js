const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const { role, department, isActive, search, page = 1, limit = 20 } = req.query;

    const query = {};

    // Filter by role for managers (only see their team)
    if (req.user.role === 'manager') {
      query.department = req.user.department;
    } else if (req.user.role === 'employee') {
      // Employees can only see themselves
      return res.json({
        users: [req.user.toJSON()],
        total: 1,
        page: 1,
        pages: 1,
      });
    }

    // Apply filters
    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
const getUser = async (req, res) => {
  try {
    // Employees can only view themselves
    if (req.user.role === 'employee' && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Managers can only view team members
    if (req.user.role === 'manager' && user.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, role, department, isActive, avatar } = req.body;

    // Check permissions
    if (req.user.role === 'employee') {
      // Employees can only update themselves (limited fields)
      if (req.params.id !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      // Only allow name and avatar updates for employees
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, avatar },
        { new: true, runValidators: true }
      ).select('-password');

      return res.json({ user });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Managers can only update team members (not role)
    if (req.user.role === 'manager') {
      if (user.department !== req.user.department) {
        return res.status(403).json({ message: 'Access denied' });
      }
      // Managers cannot change roles
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { name, department, avatar },
        { new: true, runValidators: true }
      ).select('-password');

      return res.json({ user: updatedUser });
    }

    // Admin can update everything
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, department, isActive, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Deactivate user (admin only)
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-deactivation
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot deactivate yourself' });
    }

    // Soft delete - deactivate user
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Prevent self-role changes
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If demoting the user from admin, check if this is the last active admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot demote the last active admin' });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user stats (admin only)
// @route   GET /api/users/stats
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] },
          },
        },
      },
    ]);

    const byDepartment = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = await User.countDocuments();
    const active = await User.countDocuments({ isActive: true });

    res.json({
      total,
      active,
      byRole: stats,
      byDepartment,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserStats,
};
