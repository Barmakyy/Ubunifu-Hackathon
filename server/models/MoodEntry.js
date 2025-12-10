import mongoose from 'mongoose';

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moodScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  note: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    enum: ['stressed', 'focused', 'behind', 'motivated', 'anxious', 'tired', 'confident']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for mood trend analysis
moodEntrySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('MoodEntry', moodEntrySchema);
