const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { validateMemory, sanitizeText } = require('../utils/validator');
const { readMemories, saveMemory } = require('../utils/storage');

const router = express.Router();

// Configure multer for memory photo uploads
const memoryStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/images/memory-photos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'memory-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const memoryUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

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
 * @param {Object} req - Express request with body { from, message } and optional photo
 * @param {Object} res - Express response
 * @returns {void}
 * @throws {ValidationError} If validation fails
 */
router.post('/', memoryUpload.single('photo'), async (req, res) => {
  try {
    // Rate limiting
    const clientIp = req.ip || req.connection.remoteAddress;
    if (!checkRateLimit(clientIp)) {
      // Delete uploaded file if rate limited
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a minute before submitting again.'
      });
    }

    const { from, message } = req.body;

    // Validate input
    const validation = validateMemory({ from, message });
    if (!validation.valid) {
      // Delete uploaded file if validation fails
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Create memory object (no sanitization - frontend handles escaping)
    const memory = {
      id: Date.now().toString(),
      from: from.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Add photo filename if uploaded
    if (req.file) {
      memory.photo = req.file.filename;
    }

    // Save to storage
    await saveMemory(memory);

    res.status(201).json({
      success: true,
      message: 'Memory shared successfully',
      memory
    });
  } catch (error) {
    console.error('Error creating memory:', error);
    // Delete uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({
      success: false,
      message: 'Failed to save memory'
    });
  }
});

module.exports = router;
