# Documentation Update Guide

This file contains all the updates needed for the documentation after migrating to Vercel Postgres + Blob storage with PostgreSQL session store.

## Files to Update

### 1. README.md

**Section: Project Structure (lines 163-178)**

Replace with:
```markdown
## Project Structure

```
memorial-website/
├── public/                 # Frontend files
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript
│   ├── images/            # Static photos
│   └── *.html             # Pages
├── src/                   # Backend
│   ├── routes/            # API routes
│   ├── utils/             # Utilities (storage, blob, validation)
│   ├── db/                # Database connection and initialization
│   ├── middleware/        # Authentication middleware
│   ├── config/            # Configuration
│   └── server.js          # Express server
├── docs/                  # Documentation
└── package.json
```
```

**Section: Notes (lines 180-193)**

Replace with:
```markdown
## Notes

- **Data Storage**: Memories and gallery metadata stored in Vercel Postgres (Neon)
- **Photo Storage**: All photos stored in Vercel Blob storage
- **Session Storage**: Admin sessions stored in PostgreSQL for serverless persistence
- Memory form has a 10,000 character limit
- Photo uploads limited to 10MB
- Visitors can optionally attach photos and crop them before submitting
- Visitors crop their own photos - admins cannot edit memory photos
- Rate limiting: 5 submissions per minute per IP
- User input is validated and escaped on the frontend to prevent XSS
- Admin panel uses session-based authentication with bcrypt password hashing
- All images support lazy loading for better performance
- **Data persists** across deployments and serverless function instances
```

**Section: Deploying the Website (lines 137-162)**

Replace with:
```markdown
## Deploying the Website

This application is designed for **Vercel** deployment with Postgres and Blob storage.

**Prerequisites:**
1. Vercel account (free tier available)
2. GitHub repository

**Setup Steps:**
1. Push code to GitHub
2. Import project to Vercel
3. Set up Vercel Postgres (Neon) database
4. Set up Vercel Blob storage
5. Configure environment variables

**Complete deployment guide:** See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/VERCEL_POSTGRES_SETUP.md](docs/VERCEL_POSTGRES_SETUP.md)

**Why Vercel?**
- Free tier includes Postgres database and Blob storage
- Automatic HTTPS and global CDN
- Serverless functions handle all API routes
- Data persists across deployments
- Zero configuration for production

**Environment Variables Required:**
- `ADMIN_USERNAME` - Your admin username
- `ADMIN_PASSWORD` - Your admin password
- `SESSION_SECRET` - Random secret for sessions
- `NODE_ENV` - Set to `production`
- `POSTGRES_URL` - Auto-configured by Vercel
- `BLOB_READ_WRITE_TOKEN` - Auto-configured by Vercel
```

---

### 2. docs/ADMIN.md

**Section: File Upload Security (lines 108-119)**

Replace with:
```markdown
### File Upload Security

- Only image files allowed (JPEG, PNG, GIF, WebP)
- 10MB file size limit for all uploads
- Files are validated before upload
- **Gallery photos:** Cropped by admin before upload using Cropper.js in admin panel
- **Memory photos:** Cropped by visitors before submission using Cropper.js on public form
- Uploaded files stored in **Vercel Blob** with unique identifiers
- Automatic cleanup on upload errors or deletions
- All photos accessible via secure Blob URLs
- Photos persist across deployments and serverless scaling
```

**Section: Troubleshooting (lines 153-183)**

Replace with:
```markdown
## Troubleshooting

**Can't log in:**
- Check that environment variables are set in Vercel dashboard
- Clear browser cookies and try again
- Check Vercel function logs for errors
- Verify `SESSION_SECRET` is configured

**Session expires immediately / 401 errors:**
- Session data is stored in PostgreSQL for serverless persistence
- Check that `POSTGRES_URL` environment variable is set
- Verify database connection is working
- Clear browser cookies and try logging in again

**Photos not uploading:**
- Check file size (must be under 10MB)
- Verify file is an image (JPEG, PNG, GIF, WebP)
- Ensure `BLOB_READ_WRITE_TOKEN` environment variable is set
- Check Vercel Blob storage quota (free tier: 500 GB/month bandwidth)
- Check Vercel function logs for specific errors

**Photos not displaying on public page:**
- Verify photos were successfully uploaded to Vercel Blob
- Check that database contains photo URLs
- Check browser console for errors
- Try clearing browser cache
- Verify Blob URLs are accessible

**Cropper not working:**
- **Admin panel:** Ensure Cropper.js is loaded (check browser console)
  - CDN link in admin.html: https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js
- **Memories page:** Ensure Cropper.js is loaded on public page
  - CDN link in memories.html: https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js
- Check that image file is a valid image format

**Memories not updating:**
- Check Vercel function logs for database errors
- Verify `POSTGRES_URL` environment variable is set
- Check PostgreSQL connection in Vercel Storage dashboard
- Test database connectivity
```

**Section: Backup Recommendations (lines 185-191)**

Replace with:
```markdown
## Backup Recommendations

**Database Backup:**
- Vercel Postgres (Neon) automatically backs up your database
- You can export data from Vercel Storage dashboard
- Navigate to Storage → Your Postgres database → Data tab
- Use SQL queries to export specific tables if needed

**Blob Storage:**
- Photos are stored in Vercel Blob with high redundancy
- You can browse and download photos from Vercel Storage dashboard
- Navigate to Storage → Your Blob store → Browse files

**Manual Backup (Optional):**
- Export database tables as SQL or CSV
- Download photos from Blob storage dashboard
- Store backups locally or in cloud storage (Google Drive, Dropbox, etc.)
```

---

### 3. docs/VERCEL_POSTGRES_SETUP.md

**Add new section after "Database Schema" (after line 135)**

```markdown
### `session` table:
```sql
CREATE TABLE session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
```

**Purpose:** Stores admin session data for authentication persistence across serverless function instances.

**Why needed:** Vercel serverless functions are stateless - each request may be handled by a different instance. Storing sessions in PostgreSQL ensures admin login persists across all instances.

**Managed by:** `connect-pg-simple` package (PostgreSQL session store for express-session)

**Configuration:**
- Sessions expire after 24 hours
- Table is automatically created on first server startup
- Session data includes `isAdmin` flag and username
```

**Add new section after "Troubleshooting" (after line 243)**

```markdown
### Admin session issues (401 errors)

**Error:** "Unauthorized" errors in admin panel even after logging in

**Solution:**
1. Session store is properly configured with PostgreSQL
2. Verify `POSTGRES_URL` environment variable is set
3. Check that session table exists in database
4. Clear browser cookies and log in again
5. Check Vercel function logs for session-related errors

**Technical Details:**
- Sessions are stored in PostgreSQL using `connect-pg-simple`
- This ensures sessions persist across serverless function instances
- Without database session storage, each serverless instance has its own memory, causing session loss
```

---

### 4. docs/DEPLOYMENT.md

**Section: Data Persistence on Vercel (lines 177-199)**

Replace entirely with:
```markdown
## Data Persistence

**✅ FULLY PERSISTENT STORAGE**

This application uses **Vercel Postgres** and **Vercel Blob** for complete data persistence:

**Database (Vercel Postgres - Neon):**
- Stores all memories (name, message, photo URLs, timestamps)
- Stores gallery metadata (filename, photo URL, caption, display order)
- Stores admin sessions for authentication across serverless instances
- **Data survives:** Redeployments, serverless scaling, instance restarts

**Photo Storage (Vercel Blob):**
- Stores all gallery photos
- Stores all memory photos
- Photos accessible via secure HTTPS URLs
- **Photos survive:** Redeployments, function scaling, all scenarios

**Session Storage (PostgreSQL):**
- Admin sessions stored in database, not memory
- Ensures login persists across different serverless function instances
- Fixes 401 authentication errors common in serverless environments

**No data loss on:**
- Git push / redeployment
- Vercel function scaling
- Serverless instance changes
- Project updates
- Environment variable changes

**Free Tier Limits:**
- Postgres: 256 MB storage, 60 hours compute/month
- Blob: 500 GB bandwidth/month
- Should be more than sufficient for a memorial website
```

**Section: Troubleshooting - Memories Not Saving (lines 228-235)**

Replace with:
```markdown
### Memories/Photos Not Saving

**Cause:** Database or Blob storage connection issue

**Solutions:**
1. Verify Vercel Postgres is connected (Storage tab in Vercel dashboard)
2. Verify Vercel Blob is connected (Storage tab in Vercel dashboard)
3. Check environment variables:
   - `POSTGRES_URL` should be auto-configured
   - `BLOB_READ_WRITE_TOKEN` should be auto-configured
4. Check Vercel function logs for specific errors
5. Test database connection in Storage dashboard
6. Verify free tier limits haven't been exceeded
```

**Add new troubleshooting section:**

```markdown
### Admin 401 Errors / Can't Stay Logged In

**Symptoms:**
- Log in successfully but get 401 errors on admin operations
- Session expires immediately
- Works on one tab but fails on another

**Cause:** Session persistence issue (now fixed with PostgreSQL session store)

**Solutions:**
1. Verify `POSTGRES_URL` environment variable exists
2. Check that database connection is working
3. Verify session table exists (automatically created)
4. Clear all browser cookies for the site
5. Log in again
6. Check Vercel function logs for session/database errors

**Technical Fix Applied:**
- Sessions now stored in PostgreSQL instead of memory
- Uses `connect-pg-simple` package
- Ensures sessions persist across serverless function instances
- This fix resolves the "works for gallery but not memories" issue
```

**Section: Alternative Deployment Options (lines 263-281)**

Replace with:
```markdown
## Why Vercel?

This application is **specifically designed for Vercel** with:
- Vercel Postgres (Neon) for database
- Vercel Blob for photo storage
- PostgreSQL session store for serverless authentication

**Alternative platforms would require:**
- Setting up your own PostgreSQL database
- Setting up your own object storage (S3, Cloudinary, etc.)
- Modifying code to use different storage providers
- Additional configuration and cost

**Recommendation:** Use Vercel for this project. It's free, fast, and designed to work out-of-the-box with this codebase.
```

---

### 5. docs/SETUP.md (if exists, check and update)

Check if this file references JSON files or local storage and update accordingly.

---

### 6. docs/QUICK_START.md (if exists, check and update)

Check if this file references JSON files or local storage and update accordingly.

---

## Summary of Key Changes

### What Changed:
1. **Storage**: JSON files → PostgreSQL database
2. **Photos**: Local filesystem → Vercel Blob storage
3. **Sessions**: Memory → PostgreSQL (fixes serverless issues)
4. **Persistence**: Ephemeral → Fully persistent
5. **Deployment**: Multi-platform → Vercel-specific

### Key Points to Emphasize:
- Data now persists across deployments
- No more JSON file backups needed
- Photos survive redeployments
- Sessions work correctly in serverless environment
- Free tier is sufficient for memorial website
- Vercel-specific solution (don't recommend other platforms)

### Files That No Longer Exist:
- `data/memories.json` - Now in PostgreSQL `memories` table
- `data/gallery.json` - Now in PostgreSQL `gallery` table
- `public/images/gallery/` - Now in Vercel Blob
- `public/images/memory-photos/` - Now in Vercel Blob

### New Technologies:
- `@vercel/postgres` - Vercel's PostgreSQL client
- `@vercel/blob` - Vercel's Blob storage client
- `connect-pg-simple` - PostgreSQL session store
- `pg` - PostgreSQL connection pool

### Environment Variables:
**Auto-configured by Vercel:**
- `POSTGRES_URL` (and related Postgres vars)
- `BLOB_READ_WRITE_TOKEN`

**User-configured:**
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `NODE_ENV`

---

## Next Steps

1. Update README.md with above changes
2. Update docs/ADMIN.md with above changes
3. Update docs/VERCEL_POSTGRES_SETUP.md with above changes
4. Update docs/DEPLOYMENT.md with above changes
5. Check docs/SETUP.md and docs/QUICK_START.md for any JSON/local storage references
6. Delete MIGRATION_SUMMARY.md (migration is complete)
7. Commit all documentation updates

---

Generated: 2025-12-09
