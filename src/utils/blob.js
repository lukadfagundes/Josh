const { put, del } = require('@vercel/blob');

/**
 * Uploads a file to Vercel Blob storage
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} filename - Original filename
 * @param {string} folder - Folder name (e.g., 'gallery' or 'memories')
 * @returns {Promise<{url: string}>} - URL of uploaded file
 */
async function uploadFile(fileBuffer, filename, folder) {
  try {
    const timestamp = Date.now();
    const blobFilename = `${folder}/${timestamp}-${filename}`;

    const blob = await put(blobFilename, fileBuffer, {
      access: 'public',
      addRandomSuffix: false
    });

    return { url: blob.url };
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Deletes a file from Vercel Blob storage
 * @param {string} url - URL of file to delete
 * @returns {Promise<void>}
 */
async function deleteFile(url) {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    // Don't throw - file might already be deleted
  }
}

module.exports = {
  uploadFile,
  deleteFile
};
