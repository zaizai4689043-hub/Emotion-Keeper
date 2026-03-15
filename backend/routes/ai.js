import express from 'express';
import { makeCall, getCallHistory, sendMessage, endCall, getActiveCalls } from '../controllers/aiController.js';

const router = express.Router();

// AI Assistant routes
router.post('/call', makeCall);
router.get('/call-history', getCallHistory);
router.get('/active-calls', getActiveCalls);
router.post('/message', sendMessage);
router.post('/end-call', endCall);

export default router;
