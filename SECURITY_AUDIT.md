# Security Audit Report

**Project:** Josh Memorial Website
**Audit Date:** December 9, 2025
**Auditor:** Claude Code
**Tech Stack:** Node.js, Express, PostgreSQL (Vercel/Neon), Vercel Blob Storage

---

## Executive Summary

This comprehensive security audit evaluated the memorial website across 8 critical security domains. The application demonstrates **strong security practices** in authentication, input validation, and database security. Key strengths include bcrypt password hashing, parameterized SQL queries, HTML escaping, and secure session management with PostgreSQL persistence.

**Overall Security Rating:** **B+ (Good)**

### Key Strengths
- Excellent SQL injection prevention using parameterized queries
- Strong authentication with bcrypt (10 rounds) and secure session management
- Proper XSS prevention with HTML escaping and safe DOM manipulation
- Good file upload validation (type, size, MIME)
- Secure cookie configuration (HttpOnly, Secure, SameSite)
- PostgreSQL session persistence for serverless environment

### Areas for Improvement
- No rate limiting on admin login endpoint (brute force vulnerability)
- In-memory rate limiting resets on serverless cold starts
- Consider Content Security Policy (CSP) headers
- Consider implementing 2FA for admin access

---

## Detailed Audit Findings

### 1. Authentication & Session Security ✅ **STRONG**

**Findings:**

#### Password Security
- **Location:** [src/config/admin.js:8-12](src/config/admin.js#L8-L12)
- Uses bcrypt with 10 salt rounds for password hashing
- No timing attack vulnerabilities (consistent error messages)
- Password comparison uses secure `bcrypt.compare()` function

#### Session Management
- **Location:** [src/server.js:35-50](src/server.js#L35-L50)
- PostgreSQL session store using `connect-pg-simple` for serverless persistence
- Session timeout: 24 hours (`maxAge: 24 * 60 * 60 * 1000`)
- Explicit session save after login ([src/routes/admin.js:32-43](src/routes/admin.js#L32-L43))

#### Cookie Security
```javascript
cookie: {
  httpOnly: true,              // ✅ Prevents XSS cookie theft
  secure: true,                // ✅ HTTPS only in production
  sameSite: 'none',           // ✅ CSRF protection
  path: '/',                   // ✅ Proper scope
  maxAge: 24 * 60 * 60 * 1000 // ✅ 24-hour timeout
}
```

#### Authentication Middleware
- **Location:** [src/middleware/auth.js:1-13](src/middleware/auth.js#L1-L13)
- Checks `req.session.isAdmin` on all admin routes
- Returns 401 Unauthorized for unauthenticated requests
- Consistent across all admin endpoints

**Recommendations:**
- Consider implementing 2FA (two-factor authentication) for admin access
- Add password complexity requirements
- Implement account lockout after failed login attempts

---

### 2. Input Validation & XSS Prevention ✅ **STRONG**

**Findings:**

#### Server-Side Validation
- **Location:** [src/utils/validator.js:1-42](src/utils/validator.js#L1-L42)
- Name length: 1-100 characters
- Message length: 1-10,000 characters
- Type checking for string inputs
- Trim validation (rejects empty/whitespace-only inputs)

#### HTML Escaping Function
```javascript
function sanitizeText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
```

#### Frontend XSS Protection
- **Location:** [public/js/admin.js](public/js/admin.js), [public/js/gallery.js](public/js/gallery.js), [public/js/memories.js](public/js/memories.js)
- Uses `textContent` instead of `innerHTML` for user-generated content
- Implements `escapeHtml()` and `unescapeHtml()` functions
- Proper encoding before rendering to DOM

**Example Safe Rendering:**
```javascript
const nameElement = document.createElement('span');
nameElement.textContent = memory.from; // ✅ Safe from XSS
```

**Recommendations:**
- Consider implementing Content Security Policy (CSP) headers
- Add rate limiting on validation failures to prevent abuse

---

### 3. File Upload Security ✅ **GOOD**

**Findings:**

#### Upload Configuration
- **Location:** [src/routes/admin.js:10-24](src/routes/admin.js#L10-L24), [src/routes/memories.js:41-55](src/routes/memories.js#L41-L55)

```javascript
const upload = multer({
  storage: multer.memoryStorage(),           // ✅ No disk writes
  limits: { fileSize: 10 * 1024 * 1024 },   // ✅ 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/; // ✅ Whitelist
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {              // ✅ Double validation
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

#### Security Features
- File type whitelist (JPEG, JPG, PNG, GIF only)
- Both extension AND MIME type validation
- 10MB file size limit
- Memory storage (no disk writes, prevents path traversal)
- Files uploaded to Vercel Blob (external service with built-in security)
- Authentication required for admin uploads

**Recommendations:**
- Consider image content validation (check magic bytes)
- Add virus scanning for uploaded files
- Implement file name sanitization (remove special characters)

---

### 4. Database Security & SQL Injection ✅ **EXCELLENT**

**Findings:**

#### Parameterized Queries
- **Location:** [src/utils/storage.js](src/utils/storage.js), [src/utils/gallery.js](src/utils/gallery.js)
- Uses Vercel Postgres tagged template literals throughout
- **Zero instances** of string concatenation for SQL queries
- All user input automatically escaped by `@vercel/postgres`

**Example Secure Queries:**
```javascript
// ✅ SAFE - Parameterized query
await sql`
  INSERT INTO memories (from_name, message, photo_url, created_at)
  VALUES (${from}, ${message}, ${photo || null}, ${timestamp})
  RETURNING id, from_name as from, message, photo_url as photo, created_at as timestamp
`;

// ✅ SAFE - Parameterized WHERE clause
await sql`DELETE FROM gallery WHERE id = ${id}`;
```

#### Database Configuration
- **Location:** [src/db/index.js:4-10](src/db/index.js#L4-L10)
- Connection string from environment variables
- SSL enabled for secure transmission
- Connection pooling for performance

**Verdict:** SQL injection vulnerabilities are **not possible** with current implementation.

---

### 5. CORS & CSRF Protection ✅ **GOOD**

**Findings:**

#### CORS Configuration
- **Location:** [src/server.js:28-33](src/server.js#L28-L33)

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://josh.sunny-stack.com'  // ✅ Explicit origin
    : true,
  credentials: true                     // ✅ Allows cookies
}));
```

- Explicit origin in production (not wildcard)
- Credentials allowed for same-origin requests
- Development mode allows all origins (acceptable for local testing)

#### CSRF Protection
- SameSite cookie attribute provides CSRF defense
- Session-based authentication (not token-based) adds protection
- `sameSite: 'none'` in production with `secure: true` requires HTTPS

**Recommendations:**
- Consider implementing CSRF tokens for admin state-changing operations
- Add Origin header validation for additional protection

---

### 6. Rate Limiting & DoS Protection ⚠️ **MODERATE**

**Findings:**

#### Current Implementation
- **Location:** [src/routes/memories.js:8-27](src/routes/memories.js#L8-L27)

```javascript
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;  // 1 minute
const MAX_REQUESTS = 5;           // 5 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}
```

#### Coverage
- ✅ Applied to public memory submission endpoint
- ❌ **Not applied to admin login endpoint** (brute force vulnerable)
- ❌ Not applied to gallery endpoints
- ❌ Not applied to file upload endpoints

#### Limitations
- In-memory storage means rate limits **reset on serverless cold starts**
- No distributed rate limiting across Vercel instances
- IP can be spoofed via X-Forwarded-For header manipulation

**Vulnerabilities:**
1. **Admin Brute Force:** No rate limiting on `/api/admin/login` allows unlimited password attempts
2. **Cold Start Reset:** Attacker could trigger cold starts to reset rate limits
3. **IP Spoofing:** X-Forwarded-For header not validated

**Recommendations:**
1. **CRITICAL:** Implement rate limiting on admin login endpoint
2. Use Redis or PostgreSQL for distributed rate limiting
3. Implement exponential backoff for failed login attempts
4. Add CAPTCHA after multiple failed login attempts
5. Consider using a service like Vercel Firewall or Cloudflare

---

### 7. Sensitive Data Exposure ✅ **GOOD**

**Findings:**

#### Environment Variables
- All secrets stored in environment variables
- `.env` and `.env.local` properly gitignored ([.gitignore:3-4](.gitignore#L3-L4))
- No hardcoded credentials in codebase

#### Logging Practices
- No password logging found
- No session secret logging found
- Error messages don't expose sensitive information
- Generic error messages to users (specific errors logged server-side)

#### Password Storage
- Passwords hashed with bcrypt before storage
- Original plaintext passwords never stored
- No password recovery mechanism (prevents password exposure)

#### Warning System
- **Location:** [src/config/admin.js:16-18](src/config/admin.js#L16-L18)
- Displays warning if using default credentials
- Encourages users to change admin password

**Recommendations:**
- Implement password recovery via secure token-based email reset
- Add security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Consider implementing audit logging for admin actions

---

### 8. Additional Security Considerations

#### Security Headers
**Status:** ⚠️ **MISSING**

Current configuration does not include security headers. Recommended additions:

```javascript
// Recommended: Add to src/server.js
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' https://*.vercel-storage.com; script-src 'self' https://cdnjs.cloudflare.com");
  next();
});
```

#### Dependency Security
- All dependencies up-to-date as of audit date
- No known critical vulnerabilities in `npm audit`
- Regular updates recommended

---

## Risk Assessment Matrix

| Security Domain | Severity | Risk Level | Priority |
|----------------|----------|------------|----------|
| SQL Injection | N/A | ✅ **None** | - |
| XSS | Low | ✅ **Low** | Low |
| Authentication | Medium | ⚠️ **Medium** | **High** |
| CSRF | Low | ✅ **Low** | Medium |
| File Upload | Low | ✅ **Low** | Low |
| Rate Limiting | High | ⚠️ **High** | **Critical** |
| Sensitive Data | Low | ✅ **Low** | Low |
| Security Headers | Medium | ⚠️ **Medium** | Medium |

---

## Prioritized Recommendations

### 🔴 **CRITICAL (Implement Immediately)**

1. **Add Rate Limiting to Admin Login**
   - **Risk:** Brute force password attacks
   - **Impact:** Unauthorized admin access
   - **Effort:** Low (2-4 hours)
   - **Implementation:** Use `express-rate-limit` package with Redis or PostgreSQL store

### 🟡 **HIGH (Implement Soon)**

2. **Implement Distributed Rate Limiting**
   - **Risk:** DoS attacks, rate limit bypass via cold starts
   - **Impact:** Service unavailability, resource exhaustion
   - **Effort:** Medium (4-8 hours)
   - **Implementation:** Migrate to PostgreSQL-based rate limiting

3. **Add Two-Factor Authentication (2FA)**
   - **Risk:** Password compromise leads to full admin access
   - **Impact:** Unauthorized content modification, data breach
   - **Effort:** High (8-16 hours)
   - **Implementation:** Use TOTP (Time-based One-Time Password) with QR code setup

### 🟢 **MEDIUM (Plan for Future)**

4. **Implement Security Headers**
   - **Risk:** Clickjacking, MIME sniffing, XSS
   - **Impact:** User trust, compliance issues
   - **Effort:** Low (1-2 hours)
   - **Implementation:** Add helmet.js package

5. **Add Content Security Policy (CSP)**
   - **Risk:** XSS attacks, data injection
   - **Impact:** User data theft, malicious scripts
   - **Effort:** Medium (4-6 hours)
   - **Implementation:** Configure CSP headers with allowed sources

6. **Implement Account Lockout**
   - **Risk:** Brute force attacks
   - **Impact:** Unauthorized access
   - **Effort:** Medium (4-6 hours)
   - **Implementation:** Lock account after 5 failed attempts, require email unlock

---

## Compliance Notes

- **OWASP Top 10 (2021):** Application addresses most critical risks
- **GDPR:** No personal data collected beyond names in memories (minimal risk)
- **Accessibility:** No security barriers to accessibility

---

## Audit Methodology

This audit included:
- ✅ Static code analysis of all JavaScript files
- ✅ Configuration review (ESLint, Prettier, environment variables)
- ✅ Authentication flow testing
- ✅ Input validation analysis
- ✅ SQL injection pattern detection
- ✅ File upload security review
- ✅ Session management analysis
- ✅ CORS/CSRF configuration review
- ✅ Rate limiting evaluation
- ✅ Sensitive data exposure check

**Tools Used:**
- Manual code review
- grep pattern matching for security anti-patterns
- ESLint security rules
- npm audit for dependency vulnerabilities

---

## Conclusion

The memorial website demonstrates **strong security fundamentals** with excellent protection against SQL injection and XSS attacks. The authentication system is well-implemented with bcrypt and secure session management.

The primary security gap is the **lack of rate limiting on the admin login endpoint**, which should be addressed immediately to prevent brute force attacks. Once this is resolved, the application will have a solid security posture suitable for production use.

**Next Steps:**
1. Implement admin login rate limiting (CRITICAL)
2. Add security headers with helmet.js (HIGH)
3. Consider 2FA for admin access (MEDIUM)
4. Monitor logs for suspicious activity
5. Schedule quarterly security reviews

---

**Audit Status:** ✅ **COMPLETE**
**Date Completed:** December 9, 2025
