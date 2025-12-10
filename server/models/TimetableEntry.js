import mongoose from 'mongoose';

const timetableEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['class', 'exam', 'event'],
    required: true
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6, // 0 = Sunday, 6 = Saturday
    required: true
  },
  startTime: {
    type: String,
    required: true // Format: "HH:MM"
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  instructor: {
    type: String
  },
  course: {
    type: String
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  specificDate: {
    type: Date // For one-time events like exams
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  remindersEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('TimetableEntry', timetableEntrySchema);
