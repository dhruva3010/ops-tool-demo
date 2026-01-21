const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    default: 0,
  },
  performedBy: {
    type: String,
  },
});

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['hardware', 'software', 'furniture', 'vehicle', 'other'],
      required: true,
    },
    serialNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'in-use', 'maintenance', 'retired'],
      default: 'available',
    },
    location: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedDate: {
      type: Date,
    },
    purchaseDate: {
      type: Date,
    },
    purchasePrice: {
      type: Number,
      default: 0,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    warrantyExpiry: {
      type: Date,
    },
    depreciationRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    maintenanceHistory: [maintenanceSchema],
    qrCode: {
      type: String,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate current value based on depreciation
assetSchema.methods.calculateCurrentValue = function () {
  if (!this.purchaseDate || !this.purchasePrice || !this.depreciationRate) {
    return this.purchasePrice || 0;
  }

  const yearsOwned = (Date.now() - this.purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const depreciationFactor = Math.pow(1 - this.depreciationRate / 100, yearsOwned);
  return Math.max(0, Math.round(this.purchasePrice * depreciationFactor * 100) / 100);
};

// Pre-save hook to update current value
assetSchema.pre('save', function (next) {
  this.currentValue = this.calculateCurrentValue();
  next();
});

// Index for searching
assetSchema.index({ name: 'text', serialNumber: 'text', location: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
