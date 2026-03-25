import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { recommendationsRouter } from './routes/recommendations.js';
import { searchRouter } from './routes/search.js';
import { geoRouter } from './routes/geo.js';
import { tripsRouter } from './routes/trips.js';
import { weatherRouter } from './routes/weather.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/search', searchRouter);
app.use('/api/geo', geoRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/weather', weatherRouter);

app.listen(PORT, () => {
  console.log(`TripForge server running on http://localhost:${PORT}`);
});
