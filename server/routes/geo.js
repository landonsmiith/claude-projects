import { Router } from 'express';
import fetch from 'node-fetch';
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

// GET /api/geo/autocomplete?q=...
geoRouter.get('/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json({ results: [] });

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1&featuretype=city,town,village,state,country`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TripForge/1.0 (travel planning app)' },
    });
    const data = await response.json();

    const results = data.map((item) => {
      const addr = item.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality || '';
      const state = addr.state || addr.county || '';
      const country = addr.country || '';

      // Build a clean short label
      const parts = [city || addr.name, state, country].filter(Boolean);
      const label = parts.slice(0, 3).join(', ');

      return {
        name: city || addr.suburb || addr.state || addr.country || item.display_name.split(',')[0],
        label,
        country,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
      };
    });

    // Deduplicate by label
    const seen = new Set();
    const unique = results.filter((r) => {
      if (seen.has(r.label)) return false;
      seen.add(r.label);
      return true;
    });

    res.json({ results: unique });
  } catch (err) {
    console.error('Autocomplete error:', err.message);
    res.json({ results: [] });
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
