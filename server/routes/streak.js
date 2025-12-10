import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Streak from '../models/Streak.js';

const router = express.Router();

// Get user streaks
router.get('/', authMiddleware, async (req, res) => {
  try {
    let streak = await Streak.findOne({ userId: req.userId });
    
    if (!streak) {
      streak = new Streak({ userId: req.userId });
      await streak.save();
    }
    
    res.json(streak);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching streak', error: error.message });
  }
});

export default router;
