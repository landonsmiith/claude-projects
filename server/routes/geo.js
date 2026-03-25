import { Router } from 'express';
import { resolveGeoContext, haversineDistance, recommendTravelMode } from '../services/geoService.js';

export const geoRouter = Router();

// POST /api/geo/resolve
geoRouter.post('/resolve', async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) return res.status(400).json({ error: 'location required' });

    const context = await resolveGeoContext(location);
    res.json(context);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/geo/distance
geoRouter.post('/distance', async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'from and to required' });

    const [fromCtx, toCtx] = await Promise.all([
      resolveGeoContext(from),
      resolveGeoContext(to),
    ]);

    const distanceKm = haversineDistance(fromCtx.lat, fromCtx.lng, toCtx.lat, toCtx.lng);
    const travelMode = recommendTravelMode(distanceKm);

    res.json({
      distanceKm: Math.round(distanceKm),
      travelMode,
      from: fromCtx,
      to: toCtx,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
