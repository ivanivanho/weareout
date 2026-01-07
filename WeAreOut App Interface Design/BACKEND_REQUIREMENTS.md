# Backend API Requirements for WeAreOut

## Overview
This document specifies the backend API requirements for the WeAreOut personal inventory concierge app.

---

## 🏗️ Technology Stack Recommendations

### Recommended Stack
- **Runtime:** Node.js 18+ with TypeScript
- **Framework:** Express.js or Fastify
- **Database:** PostgreSQL (with Prisma ORM)
- **Authentication:** JWT tokens
- **File Storage:** AWS S3 or Cloudflare R2 (for receipt images)
- **AI Integration:** Google Gemini Vision API
- **Email Integration:** Gmail API or IMAP for receipt scraping

### Alternative Stacks
- **Serverless:** Next.js API routes, Vercel Functions, or AWS Lambda
- **Database:** Supabase (PostgreSQL + auth built-in)
- **Backend-as-a-Service:** Firebase, Supabase, or Appwrite

---

## 📐 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  email_integration_enabled BOOLEAN DEFAULT FALSE,
  email_access_token TEXT
);
```

### Inventory Items Table
```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id),
  location_id UUID REFERENCES locations(id),
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  burn_rate DECIMAL(10, 4), -- items consumed per day
  days_remaining INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN burn_rate > 0 THEN FLOOR(quantity / burn_rate)
      ELSE NULL
    END
  ) STORED,
  status VARCHAR(20) GENERATED ALWAYS AS (
    CASE
      WHEN days_remaining IS NULL THEN 'good'
      WHEN days_remaining <= 2 THEN 'critical'
      WHEN days_remaining <= 5 THEN 'low'
      ELSE 'good'
    END
  ) STORED,
  auto_reorder_enabled BOOLEAN DEFAULT TRUE,
  reorder_threshold INTEGER DEFAULT 3, -- days
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inventory_user ON inventory_items(user_id);
CREATE INDEX idx_inventory_status ON inventory_items(status);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_category_user_name ON categories(user_id, name);
```

### Locations Table
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_location_user_name ON locations(user_id, name);
```

### Receipts Table
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(20) NOT NULL, -- 'email' or 'photo'
  image_url TEXT,
  store_name VARCHAR(255),
  purchase_date DATE,
  total_amount DECIMAL(10, 2),
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Receipt Items Table
```sql
CREATE TABLE receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2),
  unit VARCHAR(50),
  price DECIMAL(10, 2),
  matched_inventory_id UUID REFERENCES inventory_items(id),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Shopping List Table
```sql
CREATE TABLE shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  suggested_quantity DECIMAL(10, 2),
  unit VARCHAR(50),
  priority VARCHAR(20), -- 'critical', 'high', 'medium'
  purchased BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shopping_user ON shopping_list(user_id);
CREATE INDEX idx_shopping_purchased ON shopping_list(purchased);
```

---

## 🔌 API Endpoints Specification

### Base URL
```
https://api.weareout.app/v1
```

### Response Format
All responses follow this format:
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
```

---

## Authentication Endpoints

### `POST /auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### `POST /auth/login`
Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** Same as signup

### `GET /auth/me`
Get current user info (requires auth).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-07T00:00:00Z"
  }
}
```

---

## Inventory Endpoints

### `GET /inventory`
Get all inventory items for the authenticated user.

**Query Parameters:**
- `category` (optional): Filter by category ID
- `location` (optional): Filter by location ID
- `status` (optional): Filter by status ('critical', 'low', 'good')
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Milk",
      "category": "Dairy",
      "location": "Refrigerator",
      "quantity": 1,
      "unit": "gallon",
      "daysRemaining": 2,
      "status": "critical",
      "burnRate": 0.5,
      "lastUpdated": "2024-01-07T00:00:00Z"
    }
  ]
}
```

### `POST /inventory`
Create a new inventory item.

**Request:**
```json
{
  "name": "Milk",
  "category": "uuid-of-category",
  "location": "uuid-of-location",
  "quantity": 1,
  "unit": "gallon",
  "burnRate": 0.5,
  "autoReorderEnabled": true,
  "reorderThreshold": 3
}
```

### `PUT /inventory/:id`
Update an inventory item.

**Request:** Partial update of any fields from POST request

### `DELETE /inventory/:id`
Delete an inventory item.

### `GET /inventory/search?q={query}`
Search inventory items by name.

**Response:** Array of matching items

### `GET /inventory/ai-summary`
Get AI-generated summary of inventory status.

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-07",
    "criticalItems": 3,
    "lowItems": 4,
    "totalItems": 45,
    "insights": {
      "daily": [
        "3 items need immediate attention",
        "Milk expires in 2 days"
      ],
      "weekly": [
        "Dairy consumption up 15% this week",
        "Consider buying bread soon"
      ]
    },
    "recommendations": [
      "Add milk to shopping list",
      "Consider buying eggs in bulk"
    ]
  }
}
```

---

## Category Endpoints

### `GET /categories`
Get all categories for the authenticated user.

### `POST /categories`
Create a new category.

**Request:**
```json
{
  "name": "Dairy",
  "icon": "milk"
}
```

### `PUT /categories/:id`
Update a category.

### `DELETE /categories/:id`
Delete a category (must not have associated items).

### `PUT /categories/reorder`
Update sort order of categories.

**Request:**
```json
{
  "order": ["uuid1", "uuid2", "uuid3"]
}
```

---

## Location Endpoints

Same structure as Category endpoints.

---

## Receipt Endpoints

### `POST /receipts/upload`
Upload a receipt photo for processing.

**Request:** `multipart/form-data`
- `receipt`: Image file (PNG, JPG)
- `source`: "photo"

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "imageUrl": "https://storage.../receipt.jpg",
    "processed": false,
    "createdAt": "2024-01-07T00:00:00Z"
  }
}
```

### `POST /receipts/:id/process`
Process receipt using Gemini Vision API.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "storeName": "Whole Foods",
    "purchaseDate": "2024-01-06",
    "totalAmount": 45.67,
    "parsedItems": [
      {
        "name": "Organic Milk",
        "quantity": 1,
        "unit": "gallon",
        "price": 6.99,
        "category": "Dairy"
      }
    ],
    "processed": true
  }
}
```

**Implementation Note:**
Use Gemini Vision API to:
1. Extract text from receipt image
2. Parse items with quantities and prices
3. Attempt to match items to existing inventory categories
4. Return structured data

### `POST /receipts/:id/confirm`
Confirm parsed items and add/update inventory.

**Request:**
```json
{
  "items": [
    {
      "name": "Organic Milk",
      "quantity": 1,
      "unit": "gallon",
      "category": "uuid-of-category",
      "location": "uuid-of-location",
      "matchedInventoryId": "uuid-or-null"
    }
  ]
}
```

**Logic:**
- If `matchedInventoryId` exists: update quantity
- If no match: create new inventory item
- Update burn rate based on purchase history

---

## Shopping List Endpoints

### `GET /shopping-list`
Get shopping list items.

**Query Parameters:**
- `purchased`: Filter by purchased status

### `POST /shopping-list`
Add item to shopping list.

### `POST /shopping-list/generate`
Auto-generate shopping list from low/critical stock items.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "itemName": "Milk",
      "category": "Dairy",
      "suggestedQuantity": 2,
      "unit": "gallon",
      "priority": "critical",
      "addedAt": "2024-01-07T00:00:00Z"
    }
  ]
}
```

### `POST /shopping-list/:id/purchase`
Mark item as purchased.

**Request:**
```json
{
  "purchased": true
}
```

---

## 🤖 AI Integration Requirements

### Gemini Vision API Integration

**Purpose:** Parse receipt images to extract items

**Flow:**
1. User uploads receipt photo
2. Backend sends image to Gemini Vision API
3. Prompt: "Extract all items from this receipt with quantities, units, and prices. Return as JSON array."
4. Parse response into structured data
5. Attempt to match items to existing categories
6. Return for user confirmation

**API Setup:**
```bash
npm install @google/generative-ai
```

**Example Code:**
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function parseReceipt(imageBuffer: Buffer) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    Analyze this receipt image and extract all purchased items.
    Return a JSON array with this structure:
    [
      {
        "name": "item name",
        "quantity": number,
        "unit": "piece/lb/oz/gallon/etc",
        "price": number,
        "category": "best guess category"
      }
    ]
  `;
  
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg'
      }
    }
  ]);
  
  return JSON.parse(result.response.text());
}
```

### Email Receipt Scraping

**Purpose:** Automatically import receipts from email

**Options:**
1. **Gmail API** (recommended)
   - User authenticates with Gmail OAuth
   - Search for emails with receipts
   - Download attachments
   - Process with Gemini Vision

2. **IMAP** (alternative)
   - User provides email credentials
   - Connect via IMAP
   - Filter for receipt emails
   - Download attachments

**Security Note:** Store email tokens securely, use encryption

---

## 🔐 Security Requirements

### Authentication
- Use JWT tokens with 24-hour expiry
- Implement refresh tokens
- Hash passwords with bcrypt (12 rounds minimum)

### Authorization
- All endpoints require authentication (except signup/login)
- Users can only access their own data
- Validate all user input

### Data Protection
- Use HTTPS only
- Encrypt sensitive data at rest
- Sanitize all database inputs
- Rate limit API endpoints

---

## 📊 Business Logic Requirements

### Burn Rate Calculation
Calculate how quickly items are consumed:

```typescript
function calculateBurnRate(purchaseHistory: Purchase[]): number {
  // Sort by date
  const sorted = purchaseHistory.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate days between purchases
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const days = daysBetween(sorted[i-1].date, sorted[i].date);
    intervals.push(sorted[i-1].quantity / days);
  }
  
  // Average burn rate
  return intervals.reduce((a, b) => a + b, 0) / intervals.length;
}
```

### Auto-Reorder Logic
```typescript
function shouldAutoReorder(item: InventoryItem): boolean {
  if (!item.autoReorderEnabled) return false;
  if (!item.daysRemaining) return false;
  return item.daysRemaining <= item.reorderThreshold;
}
```

### Status Calculation
```typescript
function calculateStatus(daysRemaining: number | null): ItemStatus {
  if (daysRemaining === null) return 'good';
  if (daysRemaining <= 2) return 'critical';
  if (daysRemaining <= 5) return 'low';
  return 'good';
}
```

---

## 🧪 Testing Requirements

### Unit Tests
- Test all business logic functions
- Test API endpoints with mocked database
- Test authentication flows

### Integration Tests
- Test full API workflows
- Test Gemini Vision integration
- Test email integration

### Load Testing
- Handle 100+ concurrent users
- Optimize database queries
- Implement caching where appropriate

---

## 📈 Deployment Recommendations

### Hosting
- **Backend:** Railway, Render, Fly.io, or AWS
- **Database:** Supabase, Railway PostgreSQL, or AWS RDS
- **File Storage:** AWS S3, Cloudflare R2, or Supabase Storage

### Environment Variables
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=random-secret-key
JWT_REFRESH_SECRET=another-secret
GEMINI_API_KEY=your-key
AWS_S3_BUCKET=receipts-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
FRONTEND_URL=https://weareout.app
```

### Monitoring
- Set up error tracking (Sentry)
- Log API requests
- Monitor database performance
- Set up uptime monitoring

---

## 📝 Next Steps

1. **Set up database** with provided schema
2. **Implement authentication** endpoints first
3. **Build CRUD operations** for inventory/categories/locations
4. **Integrate Gemini Vision** for receipt parsing
5. **Test thoroughly** with frontend
6. **Deploy** to production

Good luck building the backend! 🚀
