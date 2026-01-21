const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
  },
});

const contractSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  value: {
    type: Number,
    default: 0,
  },
  document: {
    type: String,
  },
});

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    contacts: [contactSchema],
    address: {
      type: String,
    },
    website: {
      type: String,
    },
    contracts: [contractSchema],
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Index for searching
vendorSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Vendor', vendorSchema);
