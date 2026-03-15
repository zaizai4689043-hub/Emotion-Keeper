import express from 'express';
import { getEmotionalPhrases, getCalmingMusic, getInterventionTypes } from '../controllers/interventionController.js';

const router = express.Router();

router.get('/phrases', getEmotionalPhrases);
router.get('/music', getCalmingMusic);
router.get('/types', getInterventionTypes);

router.get('/test', (req, res) => {
  res.json({ message: 'Intervention route test successful' });
});

export default router;