const mongoose = require('mongoose');

const taskInstanceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  completedAt: {
    type: Date,
  },
  notes: {
    type: String,
  },
});

const onboardingInstanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OnboardingTemplate',
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    tasks: [taskInstanceSchema],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate progress before saving
onboardingInstanceSchema.pre('save', function (next) {
  if (this.tasks && this.tasks.length > 0) {
    const completedTasks = this.tasks.filter((t) => t.status === 'completed').length;
    this.progress = Math.round((completedTasks / this.tasks.length) * 100);

    if (this.progress === 100 && this.status === 'active') {
      this.status = 'completed';
    }
  }
  next();
});

module.exports = mongoose.model('OnboardingInstance', onboardingInstanceSchema);
