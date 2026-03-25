import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const trips = sqliteTable('trips', {
  id: text('id').primaryKey(),
  publicId: text('public_id').unique(),
  title: text('title').notNull(),
  data: text('data').notNull(), // JSON blob of full trip data
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const savedItems = sqliteTable('saved_items', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').references(() => trips.id),
  dayIndex: integer('day_index').notNull(),
  type: text('type').notNull(), // 'flight' | 'hotel' | 'activity' | 'event'
  data: text('data').notNull(), // JSON blob
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
