import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timetableEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimetableEntry',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['attended', 'missed', 'pending'],
    default: 'pending'
  },
  markedAt: {
    type: Date
  },
  motivationalNote: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index for unique attendance per user per class per date
attendanceSchema.index({ userId: 1, timetableEntryId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
