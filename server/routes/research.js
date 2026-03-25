import { Router } from 'express';
import { deepResearch } from '../services/claudeService.js';

export const researchRouter = Router();

// POST /api/research/deep
researchRouter.post('/deep', async (req, res) => {
  try {
    const { query, location, date, tripContext } = req.body;
    if (!query) return res.status(400).json({ error: 'query required' });
    if (!location) return res.status(400).json({ error: 'location required' });

    const result = await deepResearch({ query, location, date, tripContext });
    res.json(result);
  } catch (err) {
    console.error('Deep research error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
