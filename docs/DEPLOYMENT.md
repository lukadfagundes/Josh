# Deployment Guide

## Deploying to Vercel (Recommended)

Vercel offers excellent free hosting for Node.js applications with automatic HTTPS, global CDN, and easy environment variable management.

### Prerequisites

- GitHub account
- Git repository with your memorial website code
- All content added (photos, obituary, GoFundMe link)

---

## Step 1: Prepare Your Code

**Verify everything is ready:**
- ✅ Landing page photo at `public/images/landing/photo.jpg`
- ✅ Obituary text updated in `public/index.html`
- ✅ Photos uploaded via admin panel (or in `public/images/gallery/`)
- ✅ GoFundMe link added to `public/flowers.html`
- ✅ `.env.local` file created with your credentials (NOT committed to Git)

---

## Step 2: Push to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

**If you haven't set up Git yet:**
1. Create a new repository on [github.com](https://github.com)
2. Follow GitHub's instructions to push your code

---

## Step 3: Deploy to Vercel

### Initial Setup

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub** (recommended for easy integration)
3. **Click "Add New..." → "Project"**
4. **Import your GitHub repository:**
   - Select the memorial website repository
   - Click "Import"

### Project Configuration

5. **Configure Build Settings:**
   - **Project Name**: memorial-website (or your choice)
   - **Framework Preset**: Other (Vercel auto-detects Node.js)
   - **Root Directory**: ./ (leave as default)
   - **Build Command**: `npm install` (auto-detected)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install` (auto-detected)
   - **Development Command**: (leave empty)

6. **Add Environment Variables** (CRITICAL - Don't skip!):
   - Expand the "Environment Variables" section
   - Add each variable for **Production, Preview, and Development**:

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `ADMIN_USERNAME` | your-username | Your admin panel username |
   | `ADMIN_PASSWORD` | YourSecurePassword123! | Password (plaintext - app hashes it) |
   | `SESSION_SECRET` | long-random-string | Generate at randomkeygen.com |
   | `NODE_ENV` | production | Sets production mode |

   **How to add each variable:**
   - Type variable name in "Key" field
   - Enter value in "Value" field
   - Check all three boxes: Production, Preview, Development
   - Click "Add"

7. **Click "Deploy"**

Vercel will:
- Install dependencies
- Build your project
- Deploy to a global CDN
- Provide a live URL

**Your site will be live at:** `https://your-project-name.vercel.app`

---

## Step 4: Verify Deployment

**After deployment completes (2-3 minutes):**

1. Visit your live URL
2. Test all 4 pages (Home, Through the Years, Memories, In Lieu of Flowers)
3. Navigate to `/admin` and log in with your credentials
4. Test uploading a photo
5. Submit a test memory on the Memories page
6. Edit/delete test content via admin panel

---

## Step 5: Custom Domain (Optional)

**Add your own domain:**

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In Vercel dashboard → Your Project → Settings → Domains
3. Click "Add Domain"
4. Enter your domain name
5. Follow Vercel's instructions to configure DNS

Vercel automatically provides:
- Free SSL certificate
- Automatic HTTPS
- Global CDN

---

## Environment Variables Reference

### Required Variables

```env
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=your-random-secret-key-here
NODE_ENV=production
```

### Important Notes

- **ADMIN_PASSWORD**: Use plaintext - the app automatically hashes it with bcrypt
- **SESSION_SECRET**: Generate at https://randomkeygen.com/ (use "Fort Knox Password")
- **Never commit** `.env` or `.env.local` files to Git (already in `.gitignore`)
- Set these in Vercel dashboard, not in code
- The app shows a warning on startup if using default credentials

### Where to Set in Vercel

**Option 1: During Initial Deployment**
- Add in "Environment Variables" section before clicking "Deploy"

**Option 2: After Deployment**
1. Go to your project in Vercel dashboard
2. Click "Settings"
3. Click "Environment Variables" in sidebar
4. Add/edit variables
5. Redeploy for changes to take effect

---

## Updating Your Site

### Auto-Deploy on Git Push

Vercel automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update content"
git push origin main
```

Vercel will detect the push and redeploy automatically (takes ~1-2 minutes).

### Manual Redeploy

In Vercel dashboard:
1. Go to your project
2. Click "Deployments" tab
3. Click "..." on latest deployment → "Redeploy"

---

## Data Persistence on Vercel

**IMPORTANT:** Vercel has **ephemeral filesystem** - uploaded files and JSON data may be lost on redeployment.

### For Production Use, Consider:

**Option 1: External Storage (Recommended)**
- Use a database like MongoDB Atlas (free tier), Supabase, or PlanetScale
- Store memories and gallery metadata in database
- Store images on Cloudinary or Vercel Blob

**Option 2: Current Setup (Development/Testing)**
- Works fine for testing and development
- Photos and memories persist between visits
- May be lost when Vercel redeploys or scales

**To preserve data temporarily:**
1. Download `data/memories.json` before redeploying
2. Download `data/gallery.json` before redeploying
3. Download photos from `public/images/gallery/`
4. Download photos from `public/images/memory-photos/`
5. Reupload via admin panel after deployment

---

## Troubleshooting

### Build Fails

**Check:**
- All dependencies in `package.json` are correct
- No syntax errors in code
- Build logs in Vercel dashboard for error details

**Solution:**
- Review build logs in Vercel dashboard
- Test `npm install` and `npm start` locally first

### Admin Login Not Working

**Symptoms:**
- "Invalid credentials" error
- Can't access `/admin`

**Solutions:**
1. Verify environment variables are set in Vercel dashboard
2. Check that you're using the correct credentials
3. Ensure `NODE_ENV=production` is set
4. Redeploy after adding environment variables
5. Check function logs for "WARNING: Using default admin credentials"

### Memories Not Saving

**Cause:** Vercel's ephemeral filesystem

**Solutions:**
- For development: This is expected, just testing
- For production: Migrate to database (see Data Persistence section above)

### Images Not Loading

**Check:**
- Files are committed to Git
- File paths are case-sensitive
- Images exist in `public/images/` directories
- Check browser console for 404 errors

**Solution:**
```bash
git add public/images/
git commit -m "Add images"
git push
```

### Function Timeout Errors

**Cause:** Vercel has 10-second function timeout on free tier

**Solution:**
- Reduce image sizes before uploading
- Current implementation should work fine
- If issues persist, consider upgrading Vercel plan

---

## Alternative Deployment Options

### Render.com (For Persistent Storage)

If you need persistent filesystem (photos/memories survive redeployments):

1. Go to [render.com](https://render.com)
2. Create "Web Service" from GitHub repo
3. Add same environment variables
4. Free tier includes persistent disk

**Trade-off:** Slower than Vercel, may sleep after inactivity

### Railway.app

1. Go to [railway.app](https://railway.app)
2. "New Project" → Deploy from GitHub
3. Add environment variables in Variables tab
4. Auto-deploys on Git push

---

## Security Checklist

Before going live:

- [ ] Changed admin credentials from defaults
- [ ] Generated strong SESSION_SECRET
- [ ] Verified `.env.local` is in `.gitignore`
- [ ] Set `NODE_ENV=production` in Vercel
- [ ] Tested admin login works
- [ ] No sensitive data in code/Git
- [ ] HTTPS is enabled (automatic on Vercel)

---

## Performance Optimization

Vercel automatically provides:
- ✅ Global CDN (fast loading worldwide)
- ✅ Automatic caching
- ✅ Gzip/Brotli compression
- ✅ HTTP/2 and HTTP/3
- ✅ Image optimization (via Vercel Image Optimization)

No additional configuration needed!

---

## Support Resources

**Vercel Documentation:**
- [Node.js Deployment Guide](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/projects/domains)

**Need Help?**
- Check Vercel's build logs for detailed errors
- Review function logs in Vercel dashboard
- Consult Vercel's support documentation

---

## Post-Deployment

1. **Share the URL** with family and friends
2. **Test all features** thoroughly
3. **Monitor the Memories page** for submissions
4. **Backup data periodically** if using JSON storage
5. **Consider custom domain** for a more personal touch

Your memorial website is now live and accessible worldwide. 🌟
