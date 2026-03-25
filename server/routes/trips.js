import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/index.js';

export const tripsRouter = Router();

// GET /api/trips/:id
tripsRouter.get('/:id', (req, res) => {
  try {
    const trip = db.prepare('SELECT * FROM trips WHERE id = ? OR public_id = ?')
      .get(req.params.id, req.params.id);

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    res.json({
      ...trip,
      data: JSON.parse(trip.data),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/trips
tripsRouter.post('/', (req, res) => {
  try {
    const id = nanoid();
    const now = Date.now();
    const { title, data } = req.body;

    db.prepare(`
      INSERT INTO trips (id, title, data, is_public, created_at, updated_at)
      VALUES (?, ?, ?, 0, ?, ?)
    `).run(id, title || 'My Trip', JSON.stringify(data), now, now);

    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/trips/:id
tripsRouter.put('/:id', (req, res) => {
  try {
    const now = Date.now();
    const { title, data } = req.body;

    db.prepare(`
      UPDATE trips SET title = ?, data = ?, updated_at = ? WHERE id = ?
    `).run(title, JSON.stringify(data), now, req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/trips/:id/share
tripsRouter.post('/:id/share', (req, res) => {
  try {
    const publicId = nanoid(10);
    const now = Date.now();

    db.prepare(`
      UPDATE trips SET public_id = ?, is_public = 1, updated_at = ? WHERE id = ?
    `).run(publicId, now, req.params.id);

    res.json({ publicId, shareUrl: `/trip/${publicId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/trips/:id
tripsRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM trips WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
