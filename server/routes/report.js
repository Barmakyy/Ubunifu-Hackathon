import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import WeeklyReport from '../models/WeeklyReport.js';

const router = express.Router();

// Get weekly reports
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reports = await WeeklyReport.find({ userId: req.userId })
      .sort({ weekStartDate: -1 })
      .limit(10);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
});

// Get latest report
router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const report = await WeeklyReport.findOne({ userId: req.userId })
      .sort({ weekStartDate: -1 });
    
    if (!report) {
      return res.status(404).json({ message: 'No reports found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching report', error: error.message });
  }
});

export default router;
