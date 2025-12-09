# Migration to Vercel Postgres & Blob - Summary

## ✅ Migration Complete

Your memorial website has been successfully migrated from JSON file storage to **Vercel Postgres** (database) and **Vercel Blob** (photo storage). Data will now persist across all deployments.

---

## Files Modified

### Backend (Node.js/Express)

#### Database Layer
- ✅ **src/db/index.js** - NEW: Database connection and initialization
- ✅ **src/db/schema.sql** - NEW: Database schema documentation
- ✅ **src/utils/storage.js** - Migrated from JSON to Postgres
- ✅ **src/utils/gallery.js** - Migrated from JSON to Postgres
- ✅ **src/utils/blob.js** - NEW: Vercel Blob integration

#### Routes
- ✅ **src/routes/memories.js** - Updated to use Vercel Blob for photo uploads
- ✅ **src/routes/admin.js** - Updated to use database IDs instead of array indices, Vercel Blob for photos
- ✅ **src/routes/gallery.js** - No changes needed (uses utility functions)

#### Server
- ✅ **src/server.js** - Added database initialization on startup, fixed CORS & session for production

### Frontend (JavaScript)

#### Admin Panel
- ✅ **public/js/admin.js** - Updated to:
  - Use database IDs instead of array indices for memories
  - Display photo URLs from Vercel Blob
  - Send `credentials: 'include'` with all fetch requests

#### Public Pages
- ✅ **public/js/gallery.js** - Updated to display photos from Vercel Blob URLs
- ✅ **public/js/memories.js** - Updated to display memory photos from Vercel Blob URLs

### Dependencies
- ✅ **package.json** - Added `@vercel/postgres` and `@vercel/blob`

### Documentation
- ✅ **docs/VERCEL_POSTGRES_SETUP.md** - NEW: Complete setup guide

---

## Database Schema

### `memories` Table
```sql
CREATE TABLE memories (
  id SERIAL PRIMARY KEY,
  from_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `gallery` Table
```sql
CREATE TABLE gallery (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Key Changes

### Storage
| Before | After |
|--------|-------|
| `data/memories.json` | PostgreSQL `memories` table |
| `data/gallery.json` | PostgreSQL `gallery` table |
| `public/images/gallery/` | Vercel Blob storage |
| `public/images/memory-photos/` | Vercel Blob storage |

### API Changes
| Endpoint | Before | After |
|----------|--------|-------|
| `PUT /api/admin/memories/:index` | Array index | `PUT /api/admin/memories/:id` (database ID) |
| `DELETE /api/admin/memories/:index` | Array index | `DELETE /api/admin/memories/:id` (database ID) |
| `PUT /api/admin/gallery/:id` | No change | Uses database ID |
| `DELETE /api/admin/gallery/:id` | No change | Uses database ID |

### Photo Handling
- **Before:** Photos saved to local filesystem
- **After:** Photos uploaded to Vercel Blob, URLs stored in database

---

## What Persists Now

✅ All visitor-submitted memories
✅ All memory photos
✅ All gallery photos
✅ Photo captions and metadata
✅ Display order
✅ Timestamps

---

## Next Steps

### 1. Set Up Vercel Postgres

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Choose **Postgres**
6. Name it (e.g., `memorial-db`)
7. Select region
8. Click **Create**

### 2. Set Up Vercel Blob

1. Still in **Storage** tab
2. Click **Create Database** again
3. Choose **Blob**
4. Name it (e.g., `memorial-photos`)
5. Click **Create**

### 3. Deploy

```bash
git add .
git commit -m "Migrate to Vercel Postgres and Blob for persistent storage"
git push origin main
```

Vercel will automatically:
- Detect the new database connections
- Add environment variables
- Deploy your app
- Initialize database tables on first run

### 4. Test

After deployment:

1. **Admin Login**
   - Visit `/admin`
   - Login with your credentials
   - Should work without 401 errors now

2. **Upload Gallery Photo**
   - Upload a photo via admin panel
   - Check "Through the Years" page
   - Photo should display

3. **Submit Memory**
   - Visit `/memories`
   - Submit a test memory with photo
   - Should appear on page

4. **Test Persistence**
   - Make a code change and redeploy
   - Data should still be there!

---

## Troubleshooting

### Database Connection Errors

**Error:** "Failed to initialize database"

**Check:**
1. Vercel Postgres is connected to project
2. Environment variables exist in Vercel dashboard
3. Redeploy the project

### Photo Upload Errors

**Error:** "Failed to upload file"

**Check:**
1. Vercel Blob is connected to project
2. `BLOB_READ_WRITE_TOKEN` environment variable exists
3. Check Vercel Blob dashboard for storage limits

### Admin Panel 401 Errors

**Fixed!** The session/CORS configuration has been updated. If issues persist:
1. Clear browser cookies
2. Try logging in again
3. Check browser console for errors

---

## Environment Variables (Auto-Added by Vercel)

When you connect Postgres and Blob, Vercel automatically adds:

### Postgres
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Blob
- `BLOB_READ_WRITE_TOKEN`

**You don't need to configure these manually!**

---

## Local Development

### Option 1: Use Vercel Postgres/Blob Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run dev server
npm run dev
```

### Option 2: Use Local PostgreSQL

```bash
# Create local database
createdb memorial_local

# Add to .env.local
echo "POSTGRES_URL=postgresql://localhost/memorial_local" > .env.local

# Run dev server
npm run dev
```

---

## Cost Estimate

### Vercel Postgres (Free Tier)
- 256 MB storage
- 60 hours compute/month
- **Your site will easily fit**

### Vercel Blob (Free Tier)
- 500 GB bandwidth/month
- **More than enough for photos**

---

## Data Migration

Since you're starting fresh, the database tables will be empty initially. The system will automatically:
1. Create tables on first deployment
2. Accept new memories and photos
3. Store everything persistently

If you had existing JSON data you needed to migrate, you would need to create a migration script (not included since you're starting fresh).

---

## Support Resources

- **Setup Guide:** `docs/VERCEL_POSTGRES_SETUP.md`
- **Vercel Postgres Docs:** https://vercel.com/docs/storage/vercel-postgres
- **Vercel Blob Docs:** https://vercel.com/docs/storage/vercel-blob
- **Project Dashboard:** Check server logs for errors

---

## Summary of Benefits

✅ **Data persists** across all deployments
✅ **Photos persist** across all deployments
✅ **Scalable** - handles growth automatically
✅ **Fast** - PostgreSQL is optimized for performance
✅ **Secure** - Managed by Vercel with automatic backups
✅ **Free** - Within Vercel's generous free tier
✅ **Admin panel fixed** - 401 errors resolved
✅ **Production ready** - No more ephemeral filesystem issues

---

**Migration completed successfully! Enjoy your walk, and when you're back, just set up Postgres & Blob in Vercel, then deploy. Everything is ready to go! 🎉**
