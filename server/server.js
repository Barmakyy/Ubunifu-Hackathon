import dotenv from 'dotenv';
// Load environment variables FIRST
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cron from 'node-cron';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import timetableRoutes from './routes/timetable.js';
import attendanceRoutes from './routes/attendance.js';
import taskRoutes from './routes/task.js';
import goalRoutes from './routes/goal.js';
import chatbotRoutes from './routes/chatbot.js';
import streakRoutes from './routes/streak.js';
import reportRoutes from './routes/report.js';
import microTaskRoutes from './routes/microTask.js';
import moodRoutes from './routes/mood.js';

// Import schedulers
import { scheduleClassReminders } from './services/reminderService.js';
import { generateWeeklyReports } from './services/reportService.js';
import { resetWeeklyGrace } from './services/streakService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/micro-tasks', microTaskRoutes);
app.use('/api/mood', moodRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Schedule reminder service - runs every minute
    cron.schedule('* * * * *', () => {
      scheduleClassReminders();
    });
    
    // Schedule weekly reports - every Sunday at 18:00 (6 PM)
    cron.schedule('0 18 * * 0', () => {
      generateWeeklyReports();
    });
    
    // Reset grace periods - every Sunday at midnight
    cron.schedule('0 0 * * 0', () => {
      resetWeeklyGrace();
    });
    
    console.log('✅ Cron jobs scheduled');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
