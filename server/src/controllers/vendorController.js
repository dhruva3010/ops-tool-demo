const Vendor = require('../models/Vendor');

// @desc    Get all vendors
// @route   GET /api/vendors
const getVendors = async (req, res) => {
  try {
    const { category, isActive, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Vendor.countDocuments(query),
    ]);

    res.json({
      vendors,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
const getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ vendor });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create vendor
// @route   POST /api/vendors
const createVendor = async (req, res) => {
  try {
    const vendorData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const vendor = await Vendor.create(vendorData);

    res.status(201).json({ vendor });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ vendor });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete (deactivate) vendor
// @route   DELETE /api/vendors/:id
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.isActive = false;
    await vendor.save();

    res.json({ message: 'Vendor deactivated successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add contract to vendor
// @route   POST /api/vendors/:id/contracts
const addContract = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.contracts.push(req.body);
    await vendor.save();

    res.json({ vendor });
  } catch (error) {
    console.error('Add contract error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update contract
// @route   PUT /api/vendors/:id/contracts/:contractId
const updateContract = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const contract = vendor.contracts.id(req.params.contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    Object.assign(contract, req.body);
    await vendor.save();

    res.json({ vendor });
  } catch (error) {
    console.error('Update contract error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete contract
// @route   DELETE /api/vendors/:id/contracts/:contractId
const deleteContract = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.contracts.pull(req.params.contractId);
    await vendor.save();

    res.json({ vendor });
  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get vendor stats
// @route   GET /api/vendors/stats
const getVendorStats = async (req, res) => {
  try {
    const total = await Vendor.countDocuments();
    const active = await Vendor.countDocuments({ isActive: true });

    const byCategory = await Vendor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const avgRating = await Vendor.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);

    // Contracts expiring soon (30 days)
    const contractsExpiringSoon = await Vendor.aggregate([
      { $unwind: '$contracts' },
      {
        $match: {
          'contracts.endDate': {
            $gte: new Date(),
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      { $count: 'count' },
    ]);

    const totalContractValue = await Vendor.aggregate([
      { $unwind: '$contracts' },
      {
        $match: {
          'contracts.endDate': { $gte: new Date() },
        },
      },
      { $group: { _id: null, total: { $sum: '$contracts.value' } } },
    ]);

    res.json({
      total,
      active,
      byCategory,
      avgRating: avgRating[0]?.avg || 0,
      contractsExpiringSoon: contractsExpiringSoon[0]?.count || 0,
      totalContractValue: totalContractValue[0]?.total || 0,
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  addContract,
  updateContract,
  deleteContract,
  getVendorStats,
};
