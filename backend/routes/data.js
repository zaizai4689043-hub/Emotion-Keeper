import express from 'express';
import { getPsychologyPrinciples, getCommunicationAges, getCommunicationPhrases } from '../controllers/dataController.js';

const router = express.Router();

router.get('/psychology', getPsychologyPrinciples);
router.get('/communication/ages', getCommunicationAges);
router.get('/communication/phrases', getCommunicationPhrases);

router.get('/test', (req, res) => {
  res.json({ message: 'Data route test successful' });
});

export default router;