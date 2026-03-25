import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbDir = join(__dirname, '../../data');

// Ensure data directory exists
mkdirSync(dbDir, { recursive: true });

const sqlite = new Database(join(dbDir, 'tripforge.db'));

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Run migrations inline for simplicity
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    public_id TEXT UNIQUE,
    title TEXT NOT NULL,
    data TEXT NOT NULL,
    is_public INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS saved_items (
    id TEXT PRIMARY KEY,
    trip_id TEXT REFERENCES trips(id),
    day_index INTEGER NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

export default db;
