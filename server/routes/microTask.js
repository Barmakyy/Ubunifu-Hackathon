import express from 'express';
import MicroTask from '../models/MicroTask.js';
import { authMiddleware } from '../middleware/auth.js';
import { restoreStreakWithMicroTasks } from '../services/streakService.js';

const router = express.Router();

// Get user's micro-tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const microTasks = await MicroTask.find({ 
      userId: req.userId,
      completed: false,
      expiresAt: { $gt: new Date() }
    })
    .populate('relatedClassId', 'title')
    .sort({ createdAt: -1 });
    
    res.json(microTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete a micro-task
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const microTask = await MicroTask.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!microTask) {
      return res.status(404).json({ message: 'Micro-task not found' });
    }
    
    if (microTask.completed) {
      return res.status(400).json({ message: 'Task already completed' });
    }
    
    microTask.completed = true;
    microTask.completedAt = new Date();
    await microTask.save();
    
    // Check if user can restore streak
    const restoredStreak = await restoreStreakWithMicroTasks(req.userId);
    
    res.json({ 
      microTask, 
      streakRestored: !!restoredStreak,
      streak: restoredStreak
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
