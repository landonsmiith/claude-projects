import { Router } from 'express';
import { getWeatherForLocation } from '../services/weatherService.js';
import { resolveGeoContext } from '../services/geoService.js';

export const weatherRouter = Router();

// POST /api/weather
weatherRouter.post('/', async (req, res) => {
  try {
    const { location, date } = req.body;
    if (!location) return res.status(400).json({ error: 'location required' });

    const geoCtx = await resolveGeoContext(location);
    const weather = await getWeatherForLocation({
      lat: geoCtx.lat,
      lng: geoCtx.lng,
      date: date || new Date().toISOString().split('T')[0],
    });

    res.json(weather);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
