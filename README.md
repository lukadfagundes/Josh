# Memorial Website

A beautiful memorial website built with love and care.

## Features

- Emerald green color scheme
- Fully responsive (mobile and desktop)
- Four pages:
  - Landing page with photo and obituary
  - Through the Years photo gallery
  - Interactive Memories guestbook
  - Resources and support information
- **Admin Panel** for managing content:
  - Upload and manage photos
  - Edit photo captions
  - Moderate memories (edit/delete)
  - Secure authentication

## Getting Started

**NEW USERS: See [docs/SETUP.md](docs/SETUP.md) for step-by-step initial setup!**

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### First Time Setup

1. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your admin credentials:
   - ADMIN_USERNAME (default: admin)
   - ADMIN_PASSWORD (plaintext - will be hashed automatically)
   - SESSION_SECRET (generate at randomkeygen.com)

3. See [docs/SETUP.md](docs/SETUP.md) for complete setup instructions

### Running the Website

Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The website will be available at: http://localhost:3000

## Admin Panel

Access the admin panel at: **http://localhost:3000/admin**

Default credentials:
- Username: `admin`
- Password: `changeme123`

**IMPORTANT:** Change these credentials before deploying! See [docs/ADMIN.md](docs/ADMIN.md) for detailed instructions.

### Admin Features:
- Upload photos to the gallery with image cropping (Cropper.js)
- Edit photo captions
- Delete photos
- Edit visitor memories
- Delete inappropriate memories
- Secure session-based authentication

Full admin documentation: [docs/ADMIN.md](docs/ADMIN.md)

## Adding Content

### 1. Landing Page Obituary

Edit [public/index.html](public/index.html):
- Replace `[Full Name]` with his name
- Replace `[Date of Birth] - [Date of Passing]` with dates
- Replace placeholder paragraphs with your obituary

### 2. Landing Page Photo

Add his photo to `public/images/landing/` and name it `photo.jpg`

Or update the image path in [public/index.html](public/index.html):
```html
<img src="images/landing/your-photo-name.jpg" alt="Memorial photo" class="hero-image">
```

### 3. Photo Gallery

**Use Admin Panel (Recommended)**
1. Go to http://localhost:3000/admin
2. Log in with admin credentials
3. Click "Photo Gallery" tab
4. Select a photo and crop it to your liking
5. Add a caption
6. Upload - photo automatically appears in the gallery

The gallery is now fully dynamic and loads from `data/gallery.json`. Photos are stored in `public/images/gallery/` with the admin panel handling everything automatically, including image cropping.

### 4. GoFundMe Information

Edit [public/flowers.html](public/flowers.html):
- Add context about his passing (if you choose to)
- Add GoFundMe link: Replace `[YOUR_GOFUNDME_LINK]`
- Add description of what funds will support

## Image Optimization Tips

The admin panel includes a built-in image cropper (Cropper.js) that allows you to crop images before uploading. Additional optimization tips:
- The cropper allows free aspect ratio cropping
- Crop to reasonable dimensions for faster loading
- Use JPEG format for photos (recommended)
- You can also compress images before uploading (use tools like tinypng.com)
- Gallery uses lazy loading for optimal performance

## Deploying the Website

### Free Hosting Options

**Render.com** (Recommended - Free tier available):
1. Push this code to GitHub
2. Sign up at render.com
3. Create a new "Web Service"
4. Connect your GitHub repo
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variables in Render dashboard:
   - ADMIN_USERNAME
   - ADMIN_PASSWORD
   - SESSION_SECRET
   - NODE_ENV=production

**Railway.app**:
1. Push to GitHub
2. Sign up at railway.app
3. "New Project" → "Deploy from GitHub"
4. Select your repo

**Heroku** (Free tier discontinued but still an option):
- Follow Heroku's Node.js deployment guide

## Project Structure

```
memorial-website/
├── public/                 # Frontend files
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript
│   ├── images/            # Photos
│   └── *.html             # Pages
├── src/                   # Backend
│   ├── routes/            # API routes
│   ├── utils/             # Utilities
│   └── server.js          # Express server
├── data/                  # Memory storage
└── package.json
```

## Notes

- Memories are stored in `data/memories.json`
- Gallery metadata is stored in `data/gallery.json`
- The memory form has a 10,000 character limit
- Rate limiting: 5 submissions per minute per IP
- User input is validated and escaped on the frontend to prevent XSS
- Admin panel uses session-based authentication with bcrypt password hashing
- Gallery images support lazy loading for better performance

## Making Changes

Feel free to customize:
- Colors in `public/css/global.css` (search for `:root` variables)
- Layout and spacing throughout the CSS files
- Add more pages or sections as needed

## Support

If you need help with any changes or deployment, feel free to reach out.

---

Built with care in memory of a great human.
