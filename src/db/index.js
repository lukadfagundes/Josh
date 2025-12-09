const { sql } = require('@vercel/postgres');
const { Pool } = require('pg');

/**
 * Database utility module for Vercel Postgres
 * Provides connection and query capabilities
 */

// Create a connection pool for session store
// This uses the same POSTGRES_URL that @vercel/postgres uses
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Initialize database tables
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
  try {
    // Create memories table
    await sql`
      CREATE TABLE IF NOT EXISTS memories (
        id SERIAL PRIMARY KEY,
        from_name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create gallery table
    await sql`
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        photo_url TEXT NOT NULL,
        caption TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery(display_order ASC);
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = {
  sql,
  pool,
  initializeDatabase
};
