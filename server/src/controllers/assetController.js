const QRCode = require('qrcode');
const Asset = require('../models/Asset');
const User = require('../models/User');

// @desc    Get all assets
// @route   GET /api/assets
const getAssets = async (req, res) => {
  try {
    const { category, status, assignedTo, search, page = 1, limit = 20 } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'manager') {
      // Managers see assets in their department
      const teamMembers = await User.find({ department: req.user.department }).select('_id');
      const teamIds = teamMembers.map(m => m._id);
      query.$or = [
        { assignedTo: { $in: teamIds } },
        { createdBy: req.user._id },
      ];
    }

    // Apply filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { serialNumber: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const skip = (page - 1) * limit;

    const [assets, total] = await Promise.all([
      Asset.find(query)
        .populate('assignedTo', 'name email')
        .populate('vendor', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Asset.countDocuments(query),
    ]);

    res.json({
      assets,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single asset
// @route   GET /api/assets/:id
const getAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'name email department')
      .populate('vendor', 'name contacts')
      .populate('createdBy', 'name');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check access
    if (req.user.role === 'employee') {
      if (!asset.assignedTo || asset.assignedTo._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ asset });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create asset
// @route   POST /api/assets
const createAsset = async (req, res) => {
  try {
    const assetData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const asset = await Asset.create(assetData);

    // Generate QR code
    const qrData = JSON.stringify({
      id: asset._id,
      name: asset.name,
      serialNumber: asset.serialNumber,
    });
    asset.qrCode = await QRCode.toDataURL(qrData);
    await asset.save();

    res.status(201).json({ asset });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
const updateAsset = async (req, res) => {
  try {
    let asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check manager access
    if (req.user.role === 'manager') {
      if (asset.createdBy.toString() !== req.user._id.toString()) {
        const assignedUser = await User.findById(asset.assignedTo);
        if (!assignedUser || assignedUser.department !== req.user.department) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
    }

    asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('vendor', 'name');

    res.json({ asset });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete (retire) asset
// @route   DELETE /api/assets/:id
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Soft delete - mark as retired
    asset.status = 'retired';
    asset.assignedTo = null;
    asset.assignedDate = null;
    await asset.save();

    res.json({ message: 'Asset retired successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign asset to user
// @route   POST /api/assets/:id/assign
const assignAsset = async (req, res) => {
  try {
    const { userId } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.status === 'retired') {
      return res.status(400).json({ message: 'Cannot assign retired asset' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check manager can only assign to team
    if (req.user.role === 'manager') {
      if (user.department !== req.user.department) {
        return res.status(403).json({ message: 'Can only assign to team members' });
      }
    }

    asset.assignedTo = userId;
    asset.assignedDate = new Date();
    asset.status = 'in-use';
    await asset.save();

    const updatedAsset = await Asset.findById(asset._id)
      .populate('assignedTo', 'name email');

    res.json({ asset: updatedAsset });
  } catch (error) {
    console.error('Assign asset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unassign asset
// @route   POST /api/assets/:id/unassign
const unassignAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    asset.assignedTo = null;
    asset.assignedDate = null;
    asset.status = 'available';
    await asset.save();

    res.json({ asset });
  } catch (error) {
    console.error('Unassign asset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add maintenance record
// @route   POST /api/assets/:id/maintenance
const addMaintenance = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    asset.maintenanceHistory.push(req.body);
    await asset.save();

    res.json({ asset });
  } catch (error) {
    console.error('Add maintenance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get/Generate QR code
// @route   GET /api/assets/:id/qr
const getQRCode = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (!asset.qrCode) {
      const qrData = JSON.stringify({
        id: asset._id,
        name: asset.name,
        serialNumber: asset.serialNumber,
      });
      asset.qrCode = await QRCode.toDataURL(qrData);
      await asset.save();
    }

    res.json({ qrCode: asset.qrCode });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get asset stats
// @route   GET /api/assets/stats
const getAssetStats = async (req, res) => {
  try {
    const byStatus = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byCategory = await Asset.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: '$currentValue' } } },
    ]);

    const total = await Asset.countDocuments();
    const totalValue = await Asset.aggregate([
      { $group: { _id: null, total: { $sum: '$currentValue' } } },
    ]);

    const maintenanceDue = await Asset.countDocuments({
      status: 'maintenance',
    });

    const warrantyExpiringSoon = await Asset.countDocuments({
      warrantyExpiry: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      total,
      totalValue: totalValue[0]?.total || 0,
      byStatus,
      byCategory,
      maintenanceDue,
      warrantyExpiringSoon,
    });
  } catch (error) {
    console.error('Get asset stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};
