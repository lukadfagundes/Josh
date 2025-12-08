# Admin Panel Guide

## Accessing the Admin Panel

Navigate to: **http://localhost:3000/admin**

The admin link is not visible on any public pages - you must navigate to it directly.

## Default Login Credentials

**IMPORTANT: Change these before deploying!**

- **Username**: `admin`
- **Password**: `changeme123`

## Changing Admin Credentials (Recommended Method)

**Using Environment Variables:**

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and change the values:
   ```env
   ADMIN_USERNAME=your-username
   ADMIN_PASSWORD=your-secure-password
   SESSION_SECRET=your-random-secret-key-here
   ```

3. Install dependencies (if not already done):
   ```bash
   npm install
   ```

4. Restart the server:
   ```bash
   npm run dev
   ```

**Notes:**
- Password is stored as plaintext in `.env` but automatically hashed with bcrypt by the app
- `.env` file is in `.gitignore` so it won't be committed to Git
- Generate a random session secret at: https://randomkeygen.com/
- The app supports both `.env` and `.env.local` (tries `.env.local` first)
- Default credentials will show a warning message on server startup

## Admin Panel Features

### Photo Gallery Management

**Upload Photos with Image Cropping:**
1. Click "Photo Gallery" tab
2. Select a photo file (JPEG, PNG, GIF)
3. A crop modal will appear with Cropper.js
4. Crop the image to your desired size and aspect ratio (free aspect ratio supported)
5. Add a caption in the form field
6. Click "Crop & Upload"
7. The cropped image will be uploaded and automatically appear in the gallery

**Edit Caption:**
1. Find the photo in the gallery list
2. Click "Edit Caption"
3. Update the caption
4. Click "Save Changes"

**Delete Photo:**
1. Find the photo in the gallery list
2. Click "Delete"
3. Confirm deletion
4. Photo file and database entry will be removed

### Memories Management

**View All Memories:**
- Click "Memories" tab
- All submitted memories are listed with name, message, and timestamp

**Edit Memory:**
1. Find the memory you want to edit
2. Click "Edit"
3. Modify the name or message
4. Click "Save Changes"

**Delete Memory:**
1. Find the memory you want to delete
2. Click "Delete"
3. Confirm deletion

## Security Notes

### Session Security

- Sessions expire after 24 hours
- httpOnly cookies prevent XSS attacks
- In production, cookies use HTTPS only

### File Upload Security

- Only image files allowed (JPEG, PNG, GIF)
- 10MB file size limit
- Files are validated before upload
- Images can be cropped before upload using Cropper.js
- Uploaded files are stored with timestamp-based unique names

### Rate Limiting

The public memories form has rate limiting (5 submissions per minute per IP).

Admin panel does NOT have rate limiting - only you should have access.

## Important Security Steps Before Deployment

1. **Create .env file** from `.env.example`
2. **Change admin credentials** in `.env`:
   - Set ADMIN_USERNAME to your desired username
   - Set ADMIN_PASSWORD to a strong password (stored as plaintext in .env, hashed by app)
   - Generate SESSION_SECRET at https://randomkeygen.com/
3. **Set NODE_ENV=production** for production deployment
4. **Never commit .env files** - already in `.gitignore`

### Environment Variables (Already Configured)

The application already has environment variable support configured with `dotenv`. The app:
- Tries to load `.env.local` first, then `.env`
- Automatically hashes passwords with bcrypt
- Shows a warning if default credentials are used
- `.env` files are already in `.gitignore`

Required environment variables:
```
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-plaintext-password
SESSION_SECRET=your-random-secret-key-here
NODE_ENV=development (or production)
```

## Troubleshooting

**Can't log in:**
- Check username and password in [src/config/admin.js](src/config/admin.js)
- Clear browser cookies and try again
- Check server logs for errors

**Photos not uploading:**
- Check file size (must be under 10MB)
- Verify file is an image (JPEG, PNG, GIF)
- Ensure `public/images/gallery/` directory exists with write permissions

**Photos not displaying on public page:**
- Check that `data/gallery.json` is being updated
- Verify photos exist in `public/images/gallery/`
- Check browser console for errors
- Try clearing browser cache - gallery uses lazy loading

**Cropper not working:**
- Ensure Cropper.js is loaded (check browser console)
- CDN link in admin.html should load: https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js
- Check that image file is a valid image format

**Memories not updating:**
- Ensure `data/memories.json` has write permissions
- Check server logs for errors
- Try restarting the server

## Backup Recommendations

Regularly backup these files:
- `data/memories.json` - all visitor memories
- `data/gallery.json` - photo metadata
- `public/images/gallery/` - all uploaded photos

## Support

If you encounter issues with the admin panel, check the server logs in your terminal for detailed error messages.
