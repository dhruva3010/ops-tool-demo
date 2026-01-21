const mongoose = require('mongoose');

const taskTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  dueInDays: {
    type: Number,
    required: true,
    default: 7,
  },
  assigneeRole: {
    type: String,
    enum: ['employee', 'manager', 'hr'],
    default: 'employee',
  },
});

const onboardingTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    tasks: [taskTemplateSchema],
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

module.exports = mongoose.model('OnboardingTemplate', onboardingTemplateSchema);
