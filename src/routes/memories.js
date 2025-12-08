const express = require('express');
const { validateMemory, sanitizeText } = require('../utils/validator');
const { readMemories, saveMemory } = require('../utils/storage');

const router = express.Router();

// Rate limiting - simple in-memory implementation
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];

  // Filter out old requests
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

/**
 * Handles GET request to retrieve all memories
 * @param {Object} req - Express request
 * @param {Object} res - Express response with memories array
 * @returns {void}
 */
router.get('/', async (req, res) => {
  try {
    const memories = await readMemories();
    res.json({ success: true, memories });
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve memories'
    });
  }
});

/**
 * Handles POST request to save a memory
 * @param {Object} req - Express request with body { from, message }
 * @param {Object} res - Express response
 * @returns {void}
 * @throws {ValidationError} If validation fails
 */
router.post('/', async (req, res) => {
  try {
    // Rate limiting
    const clientIp = req.ip || req.connection.remoteAddress;
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a minute before submitting again.'
      });
    }

    const { from, message } = req.body;

    // Validate input
    const validation = validateMemory({ from, message });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Create memory object (no sanitization - frontend handles escaping)
    const memory = {
      from: from.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Save to storage
    await saveMemory(memory);

    res.status(201).json({
      success: true,
      message: 'Memory shared successfully',
      memory
    });
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save memory'
    });
  }
});

module.exports = router;
