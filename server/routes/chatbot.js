import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';
import { getChatbotResponse } from '../services/chatbotService.js';

const router = express.Router();

// Send message to chatbot
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    const user = await User.findById(req.userId);
    const response = await getChatbotResponse(message, user);
    
    res.json({ response });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      message: 'Error processing message', 
      error: error.message,
      response: 'I\'m here to support you! Could you tell me more about what\'s on your mind?'
    });
  }
});

export default router;
