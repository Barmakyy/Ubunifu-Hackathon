import mongoose from 'mongoose';

const weeklyReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  classesAttended: {
    type: Number,
    default: 0
  },
  classesMissed: {
    type: Number,
    default: 0
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  tasksPending: {
    type: Number,
    default: 0
  },
  goalProgress: [{
    goalId: mongoose.Schema.Types.ObjectId,
    goalTitle: String,
    progress: Number
  }],
  suggestions: [String],
  motivationalMessage: String,
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('WeeklyReport', weeklyReportSchema);
