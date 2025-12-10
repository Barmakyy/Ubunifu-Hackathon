import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Attendance from '../models/Attendance.js';
import TimetableEntry from '../models/TimetableEntry.js';
import Streak from '../models/Streak.js';
import { generateMotivationalNote } from '../services/motivationService.js';
import { updateStreak } from '../services/streakService.js';

const router = express.Router();

// Get attendance records
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const attendance = await Attendance.find(query)
      .populate('timetableEntryId')
      .sort({ date: -1 });
      
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});

// Mark attendance
router.post('/mark', authMiddleware, async (req, res) => {
  try {
    const { timetableEntryId, date, status } = req.body;
    
    // Find or create attendance record
    let attendance = await Attendance.findOne({
      userId: req.userId,
      timetableEntryId,
      date: new Date(date)
    });
    
    if (attendance) {
      attendance.status = status;
      attendance.markedAt = new Date();
    } else {
      attendance = new Attendance({
        userId: req.userId,
        timetableEntryId,
        date: new Date(date),
        status,
        markedAt: new Date()
      });
    }
    
    // Generate motivational note based on status
    const timetableEntry = await TimetableEntry.findById(timetableEntryId);
    const motivationalNote = await generateMotivationalNote(req.userId, status, timetableEntry?.title);
    attendance.motivationalNote = motivationalNote;
    
    await attendance.save();
    
    // Update streak
    await updateStreak(req.userId, 'attendance', status === 'attended');
    
    res.json({ 
      message: 'Attendance marked', 
      attendance,
      motivationalNote
    });
  } catch (error) {
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
});

// Get today's classes
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const todayClasses = await TimetableEntry.find({
      userId: req.userId,
      dayOfWeek,
      type: 'class'
    }).sort({ startTime: 1 });
    
    // Get attendance status for today
    const attendanceRecords = await Attendance.find({
      userId: req.userId,
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });
    
    const classesWithAttendance = todayClasses.map(cls => {
      const attendanceRecord = attendanceRecords.find(
        att => att.timetableEntryId.toString() === cls._id.toString()
      );
      
      return {
        ...cls.toObject(),
        attendanceStatus: attendanceRecord?.status || 'pending',
        motivationalNote: attendanceRecord?.motivationalNote
      };
    });
    
    res.json(classesWithAttendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s classes', error: error.message });
  }
});

// Get attendance stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const today = new Date();
    let startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    }
    
    const attendance = await Attendance.find({
      userId: req.userId,
      date: { $gte: startDate }
    });
    
    const stats = {
      attended: attendance.filter(a => a.status === 'attended').length,
      missed: attendance.filter(a => a.status === 'missed').length,
      pending: attendance.filter(a => a.status === 'pending').length,
      total: attendance.length,
      attendanceRate: 0
    };
    
    if (stats.total > 0) {
      stats.attendanceRate = ((stats.attended / (stats.attended + stats.missed)) * 100).toFixed(1);
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

export default router;
