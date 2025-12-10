import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import TimetableEntry from '../models/TimetableEntry.js';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get all timetable entries for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const entries = await TimetableEntry.find({ userId: req.userId }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable', error: error.message });
  }
});

// Add single timetable entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const entry = new TimetableEntry({
      userId: req.userId,
      ...req.body
    });
    await entry.save();
    res.status(201).json({ message: 'Entry added', entry });
  } catch (error) {
    res.status(500).json({ message: 'Error adding entry', error: error.message });
  }
});

// Upload CSV timetable
router.post('/upload-csv', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const results = [];
    
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const entries = results.map(row => ({
            userId: req.userId,
            title: row.title || row.Title,
            type: row.type || row.Type || 'class',
            dayOfWeek: parseInt(row.dayOfWeek || row.DayOfWeek || row.day),
            startTime: row.startTime || row.StartTime,
            endTime: row.endTime || row.EndTime,
            location: row.location || row.Location,
            instructor: row.instructor || row.Instructor,
            course: row.course || row.Course,
            isRecurring: row.isRecurring !== 'false'
          }));
          
          await TimetableEntry.insertMany(entries);
          
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);
          
          res.status(201).json({ 
            message: 'Timetable uploaded successfully', 
            count: entries.length 
          });
        } catch (error) {
          res.status(500).json({ message: 'Error processing CSV', error: error.message });
        }
      });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading timetable', error: error.message });
  }
});

// Update timetable entry
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await TimetableEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    res.json({ message: 'Entry updated', entry });
  } catch (error) {
    res.status(500).json({ message: 'Error updating entry', error: error.message });
  }
});

// Delete timetable entry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await TimetableEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting entry', error: error.message });
  }
});

export default router;
