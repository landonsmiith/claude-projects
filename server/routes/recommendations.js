import { Router } from 'express';
import { getActivityRecommendations, getSubRegionSuggestions, getLocalFestivals } from '../services/claudeService.js';
import { resolveGeoContext } from '../services/geoService.js';

export const recommendationsRouter = Router();

// GET /api/recommendations/activities
recommendationsRouter.post('/activities', async (req, res) => {
  try {
    const { location, date, travelTypes, interests, budgetTier } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'location is required' });
    }

    // Resolve geo context
    const geoContext = await resolveGeoContext(location);

    const activities = await getActivityRecommendations({
      location,
      date: date || new Date().toISOString().split('T')[0],
      travelTypes,
      interests,
      budgetTier,
      geoContext,
    });

    res.json({ activities, geoContext });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recommendations/sub-regions
recommendationsRouter.post('/sub-regions', async (req, res) => {
  try {
    const { country, tripContext } = req.body;

    if (!country) {
      return res.status(400).json({ error: 'country is required' });
    }

    const suggestions = await getSubRegionSuggestions({ country, tripContext });
    res.json({ suggestions });
  } catch (err) {
    console.error('Sub-regions error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recommendations/festivals
recommendationsRouter.post('/festivals', async (req, res) => {
  try {
    const { location, date } = req.body;

    if (!location || !date) {
      return res.status(400).json({ error: 'location and date are required' });
    }

    const festivals = await getLocalFestivals({ location, date });
    res.json({ festivals });
  } catch (err) {
    console.error('Festivals error:', err);
    res.status(500).json({ error: err.message });
  }
});
