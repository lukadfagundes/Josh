const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH } = require('../config/admin');
const { requireAuth } = require('../middleware/auth');
const { readGallery, addPhoto, updatePhoto, deletePhoto } = require('../utils/gallery');
const { readMemories, saveMemory } = require('../utils/storage');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/gallery/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    req.session.isAdmin = true;
    req.session.username = username;

    res.json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out' });
});

// Check auth status
router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: !!(req.session && req.session.isAdmin)
  });
});

// Gallery endpoints
router.get('/gallery', requireAuth, async (req, res) => {
  try {
    const photos = await readGallery();
    res.json({ success: true, photos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load gallery' });
  }
});

router.post('/gallery', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo uploaded'
      });
    }

    const { caption } = req.body;
    const photo = await addPhoto({
      filename: req.file.filename,
      caption: caption || ''
    });

    res.json({
      success: true,
      message: 'Photo added successfully',
      photo
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo'
    });
  }
});

router.put('/gallery/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const photo = await updatePhoto(id, { caption });

    res.json({
      success: true,
      message: 'Photo updated successfully',
      photo
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update photo'
    });
  }
});

router.delete('/gallery/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get photo info to delete file
    const photos = await readGallery();
    const photo = photos.find(p => p.id === id);

    if (photo) {
      const filePath = path.join(__dirname, '../../public/images/gallery/', photo.filename);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('Could not delete file:', err);
      }
    }

    await deletePhoto(id);

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete photo'
    });
  }
});

// Memories management endpoints
router.get('/memories', requireAuth, async (req, res) => {
  try {
    const memories = await readMemories();
    res.json({ success: true, memories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load memories' });
  }
});

router.put('/memories/:index', requireAuth, async (req, res) => {
  try {
    const { index } = req.params;
    const { from, message } = req.body;

    const memories = await readMemories();
    const memoryIndex = parseInt(index);

    if (memoryIndex < 0 || memoryIndex >= memories.length) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    memories[memoryIndex] = {
      ...memories[memoryIndex],
      from: from || memories[memoryIndex].from,
      message: message || memories[memoryIndex].message
    };

    // Save updated memories
    const MEMORIES_FILE = path.join(__dirname, '../../data/memories.json');
    await fs.writeFile(MEMORIES_FILE, JSON.stringify({ memories }, null, 2));

    res.json({
      success: true,
      message: 'Memory updated successfully',
      memory: memories[memoryIndex]
    });
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update memory'
    });
  }
});

router.delete('/memories/:index', requireAuth, async (req, res) => {
  try {
    const { index } = req.params;
    const memories = await readMemories();
    const memoryIndex = parseInt(index);

    if (memoryIndex < 0 || memoryIndex >= memories.length) {
      return res.status(404).json({
        success: false,
        message: 'Memory not found'
      });
    }

    memories.splice(memoryIndex, 1);

    // Save updated memories
    const MEMORIES_FILE = path.join(__dirname, '../../data/memories.json');
    await fs.writeFile(MEMORIES_FILE, JSON.stringify({ memories }, null, 2));

    res.json({
      success: true,
      message: 'Memory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete memory'
    });
  }
});

module.exports = router;
