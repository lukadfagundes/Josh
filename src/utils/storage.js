const { sql } = require('../db');

/**
 * Reads all memories from Postgres database
 * @param {Object} options - { limit?: number, offset?: number }
 * @returns {Promise<Array>}
 * @throws {DatabaseError} If query fails
 */
async function readMemories(options = {}) {
  try {
    const { limit, offset = 0 } = options;

    let query;
    if (limit) {
      query = sql`
        SELECT
          id,
          from_name as from,
          message,
          photo_url as photo,
          created_at as timestamp
        FROM memories
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      query = sql`
        SELECT
          id,
          from_name as from,
          message,
          photo_url as photo,
          created_at as timestamp
        FROM memories
        ORDER BY created_at DESC
      `;
    }

    const { rows } = await query;
    return rows;
  } catch (error) {
    console.error('Error reading memories:', error);
    throw new Error('Failed to read memories');
  }
}

/**
 * Saves a new memory to Postgres database
 * @param {Object} memory - { from, message, photo?, timestamp }
 * @returns {Promise<Object>} - The created memory with ID
 * @throws {DatabaseError} If insert fails
 */
async function saveMemory(memory) {
  try {
    const { from, message, photo, timestamp } = memory;

    const { rows } = await sql`
      INSERT INTO memories (from_name, message, photo_url, created_at)
      VALUES (${from}, ${message}, ${photo || null}, ${timestamp || new Date().toISOString()})
      RETURNING
        id,
        from_name as from,
        message,
        photo_url as photo,
        created_at as timestamp
    `;

    return rows[0];
  } catch (error) {
    console.error('Error saving memory:', error);
    throw new Error('Failed to save memory');
  }
}

/**
 * Updates a memory in the database
 * @param {number} id - Memory ID
 * @param {Object} updates - { from?, message? }
 * @returns {Promise<Object>} - Updated memory
 */
async function updateMemory(id, updates) {
  try {
    const { from, message } = updates;

    const { rows } = await sql`
      UPDATE memories
      SET
        from_name = COALESCE(${from}, from_name),
        message = COALESCE(${message}, message)
      WHERE id = ${id}
      RETURNING
        id,
        from_name as from,
        message,
        photo_url as photo,
        created_at as timestamp
    `;

    if (rows.length === 0) {
      throw new Error('Memory not found');
    }

    return rows[0];
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
}

/**
 * Deletes a memory from the database
 * @param {number} id - Memory ID
 * @returns {Promise<Object>} - Deleted memory data
 */
async function deleteMemory(id) {
  try {
    const { rows } = await sql`
      DELETE FROM memories
      WHERE id = ${id}
      RETURNING
        id,
        from_name as from,
        message,
        photo_url as photo,
        created_at as timestamp
    `;

    if (rows.length === 0) {
      throw new Error('Memory not found');
    }

    return rows[0];
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
}

module.exports = {
  readMemories,
  saveMemory,
  updateMemory,
  deleteMemory
};
