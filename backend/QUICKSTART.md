# WeAreOut Backend - Quick Start

## Get Running in 5 Minutes

### Step 1: Configure Environment (2 minutes)

```bash
# Copy environment template
cp .env.example .env

# Generate a secure JWT secret
openssl rand -base64 64

# Edit .env and set these REQUIRED values:
# - JWT_SECRET=<paste the generated secret above>
# - DB_PASSWORD=<your PostgreSQL password>
# - GEMINI_API_KEY=<your Google Gemini API key>
```

### Step 2: Set Up Database (1 minute)

```bash
# Create the database
createdb weareout

# Connect to database to create tables
psql weareout

# Copy and paste these SQL commands:
```

```sql
-- Users table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    last_login_attempt TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(token_hash)
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Token blacklist table
CREATE TABLE token_blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_jti VARCHAR(64) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    reason VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_token_blacklist_jti ON token_blacklist(token_jti);
CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- Email verifications table (optional, for email verification feature)
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);

-- Quit psql
\q
```

### Step 3: Start the Server (30 seconds)

```bash
# Development mode with auto-reload
npm run dev

# OR production mode
npm start
```

You should see:
```
========================================
  WeAreOut Backend API
========================================
  Environment: development
  Server:      http://localhost:3000
  Health:      http://localhost:3000/health
  Auth:        http://localhost:3000/api/auth
========================================
```

### Step 4: Test the API (1 minute)

**Test server health:**
```bash
curl http://localhost:3000/health
```

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "fullName": "Test User"
  }'
```

You should get a response like:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "fullName": "Test User",
      "isVerified": false,
      "isActive": true,
      "createdAt": "2026-01-06T..."
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "15m",
      "tokenType": "Bearer"
    }
  }
}
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Get current user (protected route):**
```bash
# Replace YOUR_ACCESS_TOKEN with the token from register/login response
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Refresh token:**
```bash
# Replace YOUR_REFRESH_TOKEN with the refreshToken from register/login response
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Done!

Your WeAreOut backend is now running with:
- ✅ User registration and authentication
- ✅ JWT token management (access + refresh)
- ✅ Password hashing with bcrypt
- ✅ Account security (lockout, token blacklist)
- ✅ Protected API routes
- ✅ Database integration

## Environment Variables Reference

### Minimal .env for Development

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=weareout
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT (REQUIRED - generate with: openssl rand -base64 64)
JWT_SECRET=your_super_secret_key_here

# Optional: Google Gemini (for AI features)
GEMINI_API_KEY=your_gemini_api_key
```

### All Available Variables

See `.env.example` for complete list including:
- Database pool settings
- Token expiration times
- Password policy configuration
- Rate limiting settings
- CORS origins
- Email service settings
- File upload configuration
- Logging settings

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
PORT=8000
```

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL if needed
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux
```

### JWT_SECRET Error in Production
```bash
# Generate a secure secret
openssl rand -base64 64

# Add to .env
JWT_SECRET=<paste generated secret>
```

### Password Validation Errors
Password must have:
- At least 8 characters
- 1 uppercase letter (A-Z)
- 1 lowercase letter (a-z)
- 1 number (0-9)
- 1 special character (!@#$%^&*...)

Example valid password: `Test123!@#`

## What's Next?

1. **Add More Features**
   - Item management endpoints
   - Location tracking
   - Receipt scanning with Gemini AI
   - Image upload and storage

2. **Improve Security**
   - Add rate limiting middleware
   - Implement email verification
   - Set up 2FA (optional)

3. **Production Deployment**
   - Set up CI/CD pipeline
   - Configure production database
   - Set up monitoring and logging
   - Enable HTTPS

4. **Documentation**
   - Generate API docs (Swagger/OpenAPI)
   - Write API integration guide
   - Create postman collection

## API Documentation

For complete API documentation, see:
- **SETUP.md** - Detailed setup and API reference
- **FILES_CREATED.md** - Technical implementation details

## Support

If you encounter issues:
1. Check the logs in the terminal
2. Review SETUP.md troubleshooting section
3. Verify .env configuration
4. Check database connection
5. Ensure all dependencies are installed (`npm install`)

---

**You're all set! Start building your inventory management features!** 🚀
