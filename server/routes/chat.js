import express from 'express';
import { handleChat } from '../controllers/chatController.js';

const router = express.Router();

// Chat is public but could be rate-limited in production
router.post('/', handleChat);

export default router;
