import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  targetGrade: {
    type: String
  },
  course: {
    type: String
  },
  targetDate: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  milestones: [{
    description: String,
    completed: Boolean,
    completedAt: Date
  }]
}, {
  timestamps: true
});

export default mongoose.model('Goal', goalSchema);
