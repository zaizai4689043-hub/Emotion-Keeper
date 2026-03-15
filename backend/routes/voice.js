import express from 'express';
import { getVoiceTranscripts, addVoiceTranscript, getVoiceKeywords, updateVoiceKeywords } from '../controllers/voiceController.js';

const router = express.Router();

router.get('/transcripts', getVoiceTranscripts);
router.post('/transcript', addVoiceTranscript);
router.get('/keywords', getVoiceKeywords);
router.post('/keywords', updateVoiceKeywords);

router.get('/test', (req, res) => {
  res.json({ message: 'Voice route test successful' });
});

export default router;