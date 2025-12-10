import express from 'express';
import MoodEntry from '../models/MoodEntry.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create mood entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { moodScore, note, tags } = req.body;
    
    const moodEntry = new MoodEntry({
      userId: req.userId,
      moodScore,
      note,
      tags
    });
    
    await moodEntry.save();
    res.status(201).json(moodEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's mood history
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const moodEntries = await MoodEntry.find({
      userId: req.userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });
    
    // Calculate mood trend
    const avgMood = moodEntries.length > 0
      ? moodEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / moodEntries.length
      : 0;
    
    // Check for concerning trend (3+ low mood days)
    const recentLowMood = moodEntries.slice(0, 7).filter(e => e.moodScore <= 4).length;
    
    res.json({
      entries: moodEntries,
      stats: {
        averageMood: avgMood.toFixed(1),
        totalEntries: moodEntries.length,
        concerningTrend: recentLowMood >= 3
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
