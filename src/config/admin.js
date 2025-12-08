const bcrypt = require('bcryptjs');

// Load environment variables from .env.local or .env
try {
  const dotenv = require('dotenv');
  const fs = require('fs');
  const path = require('path');

  // Try .env.local first, then .env
  if (fs.existsSync(path.join(__dirname, '../../.env.local'))) {
    dotenv.config({ path: path.join(__dirname, '../../.env.local') });
  } else {
    dotenv.config();
  }
} catch (err) {
  // dotenv not installed or no .env file, use defaults
}

// Admin credentials from environment variables or defaults
// IMPORTANT: Create a .env file from .env.example and change these values!
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

// If ADMIN_PASSWORD is provided (plaintext), hash it
// Otherwise use the pre-hashed value or default
let ADMIN_PASSWORD_HASH;
if (process.env.ADMIN_PASSWORD) {
  ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
} else {
  // Default password hash for 'changeme123'
  ADMIN_PASSWORD_HASH = bcrypt.hashSync('changeme123', 10);
}

// Session secret from environment or default
const SESSION_SECRET = process.env.SESSION_SECRET || 'memorial-site-secret-key-change-this';

// Warn if using default credentials
if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.warn('\n⚠️  WARNING: Using default admin credentials!');
  console.warn('   Create a .env file from .env.example and set secure credentials.\n');
}

module.exports = {
  ADMIN_USERNAME,
  ADMIN_PASSWORD_HASH,
  SESSION_SECRET
};
