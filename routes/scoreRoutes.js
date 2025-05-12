// routes/scoreRoutes.js
import express from 'express';
import { getCurrentScores, getAllProjectScores } from '../models/scoreModel.js';

const router = express.Router();

router.get('/current-scores', async (req, res) => {
  try {
    const scores = await getCurrentScores();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/project-scores', async (req, res) => {
  try {
    const scores = await getAllProjectScores();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
