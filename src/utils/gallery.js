const fs = require('fs').promises;
const path = require('path');

const GALLERY_FILE = path.join(__dirname, '../../data/gallery.json');

/**
 * Ensures the gallery file exists
 * @returns {Promise<void>}
 */
async function ensureFileExists() {
  try {
    await fs.access(GALLERY_FILE);
  } catch (error) {
    await fs.writeFile(GALLERY_FILE, JSON.stringify({ photos: [] }, null, 2));
  }
}

/**
 * Reads all gallery photos
 * @returns {Promise<Array>}
 */
async function readGallery() {
  try {
    await ensureFileExists();
    const data = await fs.readFile(GALLERY_FILE, 'utf8');
    const { photos } = JSON.parse(data);
    return photos.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error reading gallery:', error);
    throw new Error('Failed to read gallery');
  }
}

/**
 * Saves gallery data
 * @param {Array} photos - Array of photo objects
 * @returns {Promise<void>}
 */
async function saveGallery(photos) {
  try {
    await fs.writeFile(GALLERY_FILE, JSON.stringify({ photos }, null, 2));
  } catch (error) {
    console.error('Error saving gallery:', error);
    throw new Error('Failed to save gallery');
  }
}

/**
 * Adds a new photo to gallery
 * @param {Object} photo - { filename, caption }
 * @returns {Promise<Object>}
 */
async function addPhoto(photo) {
  try {
    const photos = await readGallery();
    const newId = Date.now().toString();
    const maxOrder = photos.length > 0 ? Math.max(...photos.map(p => p.order)) : 0;

    const newPhoto = {
      id: newId,
      filename: photo.filename,
      caption: photo.caption || '',
      order: maxOrder + 1
    };

    photos.push(newPhoto);
    await saveGallery(photos);
    return newPhoto;
  } catch (error) {
    console.error('Error adding photo:', error);
    throw new Error('Failed to add photo');
  }
}

/**
 * Updates a photo's caption
 * @param {string} id - Photo ID
 * @param {Object} updates - { caption }
 * @returns {Promise<Object>}
 */
async function updatePhoto(id, updates) {
  try {
    const photos = await readGallery();
    const index = photos.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error('Photo not found');
    }

    photos[index] = {
      ...photos[index],
      ...updates
    };

    await saveGallery(photos);
    return photos[index];
  } catch (error) {
    console.error('Error updating photo:', error);
    throw error;
  }
}

/**
 * Deletes a photo from gallery
 * @param {string} id - Photo ID
 * @returns {Promise<void>}
 */
async function deletePhoto(id) {
  try {
    const photos = await readGallery();
    const filtered = photos.filter(p => p.id !== id);

    if (filtered.length === photos.length) {
      throw new Error('Photo not found');
    }

    await saveGallery(filtered);
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

module.exports = {
  readGallery,
  addPhoto,
  updatePhoto,
  deletePhoto
};
