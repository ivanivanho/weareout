# WeAreOut Backend - Setup Guide

## Quick Start

### 1. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

**REQUIRED:** Edit `.env` and set these critical values:
- `JWT_SECRET` - Generate a secure random string (use `openssl rand -base64 64`)
- `DB_PASSWORD` - Your PostgreSQL password
- `GEMINI_API_KEY` - Your Google Gemini API key (for AI features)

### 2. Database Setup

Ensure PostgreSQL is running and create the database:

```bash
# Create database
createdb weareout

# The application will need these tables (run migrations separately):
# - users
# - refresh_tokens
# - token_blacklist
# - email_verifications
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in .env)

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Public Endpoints

**POST /api/auth/register**
- Register a new user
- Body: `{ email, password, fullName }`
- Returns: `{ user, tokens }`

**POST /api/auth/login**
- Login user
- Body: `{ email, password }`
- Returns: `{ user, tokens }`

**POST /api/auth/refresh**
- Refresh access token
- Body: `{ refreshToken }`
- Returns: `{ user, tokens }`

**POST /api/auth/verify-email**
- Verify email with token
- Body: `{ token }`
- Returns: `{ user }`

**GET /api/auth/health**
- Check auth service status
- Returns: `{ success, message, timestamp }`

#### Protected Endpoints (Require Bearer Token)

**POST /api/auth/logout**
- Logout and blacklist token
- Headers: `Authorization: Bearer <token>`
- Body: `{ refreshToken }` (optional)
- Returns: `{ message }`

**GET /api/auth/me**
- Get current user profile
- Headers: `Authorization: Bearer <token>`
- Returns: `{ user }`

### General Endpoints

**GET /**
- API information
- Returns: API name, version, available endpoints

**GET /health**
- Server health check
- Returns: Server status, environment, uptime

## Authentication Flow

### Registration
1. Client sends `POST /api/auth/register` with user details
2. Server validates input and password policy
3. Password is hashed with bcrypt (12 rounds)
4. User is created in database
5. Access token (15min) and refresh token (7 days) are generated
6. Tokens returned to client

### Login
1. Client sends `POST /api/auth/login` with credentials
2. Server validates email and password
3. Checks for account lockout (5 failed attempts = 15min lock)
4. On success, generates new tokens
5. Failed login attempts are tracked

### Token Usage
1. Client includes access token in `Authorization: Bearer <token>` header
2. Protected routes verify token via auth middleware
3. Middleware checks:
   - Token signature and expiration
   - Token blacklist (for logout)
   - User exists and is active
4. User info attached to `req.user`

### Token Refresh
1. When access token expires, client sends refresh token
2. Server validates refresh token from database
3. Generates new access token and optionally rotates refresh token
4. Old refresh token is revoked (token rotation for security)

### Logout
1. Client sends `POST /api/auth/logout` with access token
2. Access token is blacklisted (cannot be reused)
3. Optional: Refresh token can be revoked

## Security Features

### Password Security
- Bcrypt hashing with 12 salt rounds
- Password policy enforcement:
  - Minimum 8 characters
  - Requires uppercase, lowercase, numbers, special characters
  - Maximum 72 characters (bcrypt limit)

### Token Security
- JWT with HS256 algorithm
- Short-lived access tokens (15 minutes)
- Refresh token rotation
- Token blacklisting for logout
- Tokens stored as SHA256 hashes in database

### Account Protection
- Failed login tracking
- Account lockout after 5 failed attempts
- IP address and device tracking for sessions
- Maximum 5 active sessions per user

### API Security
- CORS protection
- Request rate limiting (configured in auth.js)
- Security headers (X-Frame-Options, CSP, etc.)
- JSON payload size limits (10MB)
- SQL injection protection (parameterized queries)

## Environment Variables

See `.env.example` for all available configuration options.

### Critical Variables
- `JWT_SECRET` - Secret for signing JWT tokens (REQUIRED in production)
- `DB_*` - Database connection settings
- `GEMINI_API_KEY` - Google Gemini API key

### Optional Configuration
- Token expiration times
- Password policy settings
- Rate limiting thresholds
- CORS allowed origins
- Session limits

## Project Structure

```
src/
├── config/
│   ├── auth.js          # JWT, bcrypt, password policy config
│   └── database.js      # PostgreSQL pool configuration
├── controllers/
│   └── authController.js # Auth logic (register, login, logout, refresh)
├── middleware/
│   └── auth.js          # JWT verification middleware
├── routes/
│   └── auth.js          # Auth route definitions
├── utils/
│   └── jwt.js           # JWT token utilities
└── server.js            # Express app & server setup
```

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Common Error Codes
- `NO_TOKEN` - Authorization header missing
- `INVALID_TOKEN` - Token is invalid or malformed
- `TOKEN_EXPIRED` - Token has expired
- `TOKEN_REVOKED` - Token has been blacklisted
- `INVALID_CREDENTIALS` - Wrong email or password
- `ACCOUNT_LOCKED` - Too many failed login attempts
- `EMAIL_EXISTS` - Email already registered
- `WEAK_PASSWORD` - Password doesn't meet requirements

## Development

### Testing the API

Use curl or any API client (Postman, Insomnia, etc.):

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get current user (protected)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

### Database Queries

Enable query logging in development:
```env
NODE_ENV=development
DB_QUERY_LOGGING=true
```

## Troubleshooting

### "Port already in use"
Change the PORT in `.env` or kill the process using port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

### "Database connection failed"
- Ensure PostgreSQL is running
- Check DB credentials in `.env`
- Verify database exists: `psql -l`

### "JWT_SECRET required in production"
Set a secure JWT_SECRET in `.env`:
```bash
openssl rand -base64 64
```

### Token errors
- Ensure token is sent in `Authorization: Bearer <token>` format
- Check token hasn't expired (15min default)
- Verify token wasn't blacklisted (after logout)

## Next Steps

1. Set up database migrations (create user tables)
2. Implement email verification service
3. Add rate limiting middleware
4. Set up logging service
5. Configure production environment
6. Add API documentation (Swagger/OpenAPI)
7. Implement additional features (items, locations, etc.)

## Production Deployment

Before deploying to production:

1. ✅ Set strong `JWT_SECRET`
2. ✅ Use production database credentials
3. ✅ Set `NODE_ENV=production`
4. ✅ Configure CORS allowed origins
5. ✅ Enable HTTPS/TLS
6. ✅ Set up proper logging
7. ✅ Configure rate limiting
8. ✅ Set up monitoring and alerts
9. ✅ Regular database backups
10. ✅ Security audit and penetration testing
