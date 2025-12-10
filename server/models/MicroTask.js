import mongoose from 'mongoose';

const microTaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimetableEntry'
  },
  type: {
    type: String,
    enum: ['read_slides', 'watch_clip', 'do_mcqs', 'summarize', 'voice_note'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedMinutes: {
    type: Number,
    default: 15,
    min: 5,
    max: 30
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  expiresAt: {
    type: Date,
    required: true // 48 hours from creation for streak restore
  },
  streakRestoreEligible: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Micro-task templates for each type
export const microTaskTemplates = {
  read_slides: {
    title: 'Quick Review: Read 3 Slides',
    description: 'Read 3 key slides from {className} and highlight 2 main points',
    estimatedMinutes: 10
  },
  watch_clip: {
    title: 'Watch 5-Minute Summary',
    description: 'Watch a short clip covering today\'s {className} topic',
    estimatedMinutes: 5
  },
  do_mcqs: {
    title: 'Quick Quiz: 5 MCQs',
    description: 'Test your understanding with 5 quick questions on {className}',
    estimatedMinutes: 10
  },
  summarize: {
    title: 'Write 3 Bullet Points',
    description: 'Summarize {className} in 3 key bullet points',
    estimatedMinutes: 15
  },
  voice_note: {
    title: 'Record 60s Voice Summary',
    description: 'Record a quick voice note explaining what {className} covered',
    estimatedMinutes: 5
  }
};

export default mongoose.model('MicroTask', microTaskSchema);
