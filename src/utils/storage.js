const fs = require('fs').promises;
const path = require('path');

const MEMORIES_FILE = path.join(__dirname, '../../data/memories.json');

/**
 * Ensures the memories file exists
 * @returns {Promise<void>}
 */
async function ensureFileExists() {
  try {
    await fs.access(MEMORIES_FILE);
  } catch (error) {
    await fs.writeFile(MEMORIES_FILE, JSON.stringify({ memories: [] }, null, 2));
  }
}

/**
 * Reads all memories from JSON storage
 * @param {Object} options - { limit?: number, offset?: number }
 * @returns {Promise<Array>}
 * @throws {FileSystemError} If read fails
 */
async function readMemories(options = {}) {
  try {
    await ensureFileExists();
    const data = await fs.readFile(MEMORIES_FILE, 'utf8');
    const { memories } = JSON.parse(data);

    // Sort by timestamp descending (newest first)
    const sorted = memories.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    // Apply pagination if provided
    const { limit, offset = 0 } = options;
    if (limit) {
      return sorted.slice(offset, offset + limit);
    }

    return sorted;
  } catch (error) {
    console.error('Error reading memories:', error);
    throw new Error('Failed to read memories');
  }
}

/**
 * Appends memory to JSON storage file
 * @param {Object} memory - { from, message, timestamp }
 * @returns {Promise<void>}
 * @throws {FileSystemError} If write fails
 */
async function saveMemory(memory) {
  try {
    await ensureFileExists();
    const data = await fs.readFile(MEMORIES_FILE, 'utf8');
    const json = JSON.parse(data);

    json.memories.push(memory);

    await fs.writeFile(MEMORIES_FILE, JSON.stringify(json, null, 2));
  } catch (error) {
    console.error('Error saving memory:', error);
    throw new Error('Failed to save memory');
  }
}

module.exports = {
  readMemories,
  saveMemory
};
