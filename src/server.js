const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const memoriesRouter = require('./routes/memories');
const adminRouter = require('./routes/admin');
const galleryRouter = require('./routes/gallery');
const { SESSION_SECRET } = require('./config/admin');
const { initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - allow credentials for same-origin requests
// In production with sameSite:'none', we must specify the exact origin
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://josh.sunny-stack.com'
    : true,
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Session middleware
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// API Routes
app.use('/api/memories', memoriesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/gallery', galleryRouter);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/through-years', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/through-years.html'));
});

app.get('/memories', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/memories.html'));
});

app.get('/flowers', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/flowers.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database tables
    await initializeDatabase();
    console.log('Database initialized');

    // Start server
    app.listen(PORT, () => {
      console.log(`Memorial website running on http://localhost:${PORT}`);
      console.log(`Press Ctrl+C to stop the server`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
