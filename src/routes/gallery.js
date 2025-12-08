const express = require('express');
const { readGallery } = require('../utils/gallery');

const router = express.Router();

/**
 * Public endpoint to get gallery photos
 */
router.get('/', async (req, res) => {
  try {
    const photos = await readGallery();
    res.json({ success: true, photos });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve gallery'
    });
  }
});

module.exports = router;
