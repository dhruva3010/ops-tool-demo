const OnboardingTemplate = require('../models/OnboardingTemplate');
const OnboardingInstance = require('../models/OnboardingInstance');
const User = require('../models/User');

// ============ TEMPLATES ============

// @desc    Get all templates
// @route   GET /api/onboarding/templates
const getTemplates = async (req, res) => {
  try {
    const { department, isActive, page = 1, limit = 20 } = req.query;

    const query = {};
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      OnboardingTemplate.find(query)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      OnboardingTemplate.countDocuments(query),
    ]);

    res.json({
      templates,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single template
// @route   GET /api/onboarding/templates/:id
const getTemplate = async (req, res) => {
  try {
    const template = await OnboardingTemplate.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create template
// @route   POST /api/onboarding/templates
const createTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const template = await OnboardingTemplate.create(templateData);

    res.status(201).json({ template });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update template
// @route   PUT /api/onboarding/templates/:id
const updateTemplate = async (req, res) => {
  try {
    const template = await OnboardingTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete template
// @route   DELETE /api/onboarding/templates/:id
const deleteTemplate = async (req, res) => {
  try {
    const template = await OnboardingTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if template is in use
    const instancesCount = await OnboardingInstance.countDocuments({
      template: template._id,
      status: 'active',
    });

    if (instancesCount > 0) {
      // Soft delete
      template.isActive = false;
      await template.save();
      return res.json({ message: 'Template deactivated (in use by active instances)' });
    }

    await template.deleteOne();
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============ INSTANCES ============

// @desc    Get all instances
// @route   GET /api/onboarding/instances
const getInstances = async (req, res) => {
  try {
    const { status, employee, page = 1, limit = 20 } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (req.user.role === 'manager') {
      // Get team members
      const teamMembers = await User.find({ department: req.user.department }).select('_id');
      query.employee = { $in: teamMembers.map(m => m._id) };
    }

    if (status) query.status = status;
    if (employee) query.employee = employee;

    const skip = (page - 1) * limit;

    const [instances, total] = await Promise.all([
      OnboardingInstance.find(query)
        .populate('employee', 'name email department')
        .populate('template', 'name')
        .populate('tasks.assignee', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      OnboardingInstance.countDocuments(query),
    ]);

    res.json({
      instances,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get instances error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single instance
// @route   GET /api/onboarding/instances/:id
const getInstance = async (req, res) => {
  try {
    const instance = await OnboardingInstance.findById(req.params.id)
      .populate('employee', 'name email department')
      .populate('template', 'name department')
      .populate('tasks.assignee', 'name email');

    if (!instance) {
      return res.status(404).json({ message: 'Instance not found' });
    }

    // Check access
    if (req.user.role === 'employee') {
      if (instance.employee._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ instance });
  } catch (error) {
    console.error('Get instance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create onboarding instance
// @route   POST /api/onboarding/instances
const createInstance = async (req, res) => {
  try {
    const { employeeId, templateId, startDate } = req.body;

    // Get template
    const template = await OnboardingTemplate.findById(templateId);
    if (!template || !template.isActive) {
      return res.status(404).json({ message: 'Template not found or inactive' });
    }

    // Get employee
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if employee already has active onboarding
    const existingInstance = await OnboardingInstance.findOne({
      employee: employeeId,
      status: 'active',
    });

    if (existingInstance) {
      return res.status(400).json({ message: 'Employee already has active onboarding' });
    }

    // Calculate task due dates and create tasks
    const instanceStartDate = startDate ? new Date(startDate) : new Date();
    const tasks = template.tasks.map(task => ({
      title: task.title,
      description: task.description,
      dueDate: new Date(instanceStartDate.getTime() + task.dueInDays * 24 * 60 * 60 * 1000),
      assignee: task.assigneeRole === 'employee' ? employeeId : null,
      status: 'pending',
    }));

    const instance = await OnboardingInstance.create({
      employee: employeeId,
      template: templateId,
      startDate: instanceStartDate,
      tasks,
    });

    const populatedInstance = await OnboardingInstance.findById(instance._id)
      .populate('employee', 'name email')
      .populate('template', 'name');

    res.status(201).json({ instance: populatedInstance });
  } catch (error) {
    console.error('Create instance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task status
// @route   PUT /api/onboarding/instances/:id/tasks/:taskId
const updateTask = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const instance = await OnboardingInstance.findById(req.params.id);

    if (!instance) {
      return res.status(404).json({ message: 'Instance not found' });
    }

    // Check access for employees
    if (req.user.role === 'employee') {
      if (instance.employee.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const task = instance.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task
    task.status = status;
    if (notes) task.notes = notes;
    if (status === 'completed') {
      task.completedAt = new Date();
    }

    await instance.save();

    const updatedInstance = await OnboardingInstance.findById(instance._id)
      .populate('employee', 'name email')
      .populate('template', 'name')
      .populate('tasks.assignee', 'name');

    res.json({ instance: updatedInstance });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel onboarding instance
// @route   PUT /api/onboarding/instances/:id/cancel
const cancelInstance = async (req, res) => {
  try {
    const instance = await OnboardingInstance.findById(req.params.id);

    if (!instance) {
      return res.status(404).json({ message: 'Instance not found' });
    }

    instance.status = 'cancelled';
    await instance.save();

    res.json({ message: 'Onboarding cancelled', instance });
  } catch (error) {
    console.error('Cancel instance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get onboarding stats
// @route   GET /api/onboarding/stats
const getOnboardingStats = async (req, res) => {
  try {
    const active = await OnboardingInstance.countDocuments({ status: 'active' });
    const completed = await OnboardingInstance.countDocuments({ status: 'completed' });

    // Average completion rate
    const avgProgress = await OnboardingInstance.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, avg: { $avg: '$progress' } } },
    ]);

    // Overdue tasks
    const overdueTasks = await OnboardingInstance.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$tasks' },
      {
        $match: {
          'tasks.status': { $ne: 'completed' },
          'tasks.dueDate': { $lt: new Date() },
        },
      },
      { $count: 'count' },
    ]);

    // Tasks due soon (7 days)
    const tasksDueSoon = await OnboardingInstance.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$tasks' },
      {
        $match: {
          'tasks.status': { $ne: 'completed' },
          'tasks.dueDate': {
            $gte: new Date(),
            $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      { $count: 'count' },
    ]);

    res.json({
      active,
      completed,
      avgProgress: avgProgress[0]?.avg || 0,
      overdueTasks: overdueTasks[0]?.count || 0,
      tasksDueSoon: tasksDueSoon[0]?.count || 0,
    });
  } catch (error) {
    console.error('Get onboarding stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  // Templates
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  // Instances
  getInstances,
  getInstance,
  createInstance,
  updateTask,
  cancelInstance,
  getOnboardingStats,
};
