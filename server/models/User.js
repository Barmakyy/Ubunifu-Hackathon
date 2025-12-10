import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  institution: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  semesterGoals: [{
    type: String,
    maxlength: 3
  }],
  studyPreference: {
    type: String,
    enum: ['morning', 'night', 'weekend', 'flexible'],
    default: 'flexible'
  },
  motivationStyle: {
    type: String,
    enum: ['friendly', 'strict', 'chill', 'hype'],
    default: 'friendly'
  },
  motivationPersona: {
    type: String,
    enum: ['hustler', 'anxious', 'busy', 'skeptic'],
    default: 'hustler'
  },
  dndStart: {
    type: String,
    default: '22:00'
  },
  dndEnd: {
    type: String,
    default: '07:00'
  },
  maxNotificationsPerDay: {
    type: Number,
    default: 6,
    min: 0,
    max: 20
  },
  graceUsedThisWeek: {
    type: Boolean,
    default: false
  },
  lastGraceDate: Date,
  consentPushNotifications: {
    type: Boolean,
    default: true
  },
  consentMoodTracking: {
    type: Boolean,
    default: true
  },
  consentLocationTracking: {
    type: Boolean,
    default: false
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
