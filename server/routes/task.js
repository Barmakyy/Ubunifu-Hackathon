import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Task from '../models/Task.js';
import { updateStreak } from '../services/streakService.js';

const router = express.Router();

// Get all tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { completed, category } = req.query;
    const query = { userId: req.userId };
    
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    const tasks = await Task.find(query).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Get today's tasks
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tasks = await Task.find({
      userId: req.userId,
      dueDate: { $gte: today, $lt: tomorrow }
    }).sort({ priority: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today\'s tasks', error: error.message });
  }
});

// Create task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const task = new Task({
      userId: req.userId,
      ...req.body
    });
    await task.save();
    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// Update task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const wasCompleted = task.completed;
    Object.assign(task, req.body);
    
    // If task is being marked as completed
    if (!wasCompleted && task.completed) {
      task.completedAt = new Date();
      await updateStreak(req.userId, 'task', true);
    }
    
    await task.save();
    res.json({ message: 'Task updated', task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

// Get task stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const allTasks = await Task.find({
      userId: req.userId,
      createdAt: { $gte: weekAgo }
    });
    
    const stats = {
      total: allTasks.length,
      completed: allTasks.filter(t => t.completed).length,
      pending: allTasks.filter(t => !t.completed).length,
      overdue: allTasks.filter(t => !t.completed && new Date(t.dueDate) < today).length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task stats', error: error.message });
  }
});

export default router;
