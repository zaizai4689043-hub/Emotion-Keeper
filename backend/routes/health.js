import express from 'express';
import { getHealthData, getBloodPressureReadings, updateHealthData } from '../controllers/healthController.js';

const router = express.Router();

router.get('/data', getHealthData);
router.get('/blood-pressure', getBloodPressureReadings);
router.post('/update', updateHealthData);

router.get('/test', (req, res) => {
  res.json({ message: 'Health route test successful' });
});

export default router;