import { Router } from 'express';
import { searchEvents } from '../services/searchService.js';

export const searchRouter = Router();

// POST /api/search/events
searchRouter.post('/events', async (req, res) => {
  try {
    const { location, date } = req.body;
    if (!location) return res.status(400).json({ error: 'location required' });

    const results = await searchEvents({ location, date });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
