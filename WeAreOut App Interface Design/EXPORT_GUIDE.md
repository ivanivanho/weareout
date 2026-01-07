# WeAreOut Export & Deployment Guide

## Overview
This guide will help you export your WeAreOut frontend from Figma Make and connect it to your backend API.

---

## 📦 What's Included

### Frontend Code Structure
```
/src
├── /app
│   ├── App.tsx                 # Main app component
│   └── /components             # All UI components
│       ├── Dashboard.tsx       # Main inventory dashboard
│       ├── ShoppingList.tsx    # Shopping list view
│       ├── Setup.tsx           # Settings/setup screen
│       └── ...                 # Other components
├── /services                   # 🔑 API service layer
│   ├── api.ts                  # HTTP client
│   ├── inventory.service.ts    # Inventory endpoints
│   ├── category.service.ts     # Category management
│   ├── location.service.ts     # Location management
│   ├── auth.service.ts         # Authentication
│   ├── receipt.service.ts      # Receipt scanning
│   └── shopping.service.ts     # Shopping list
├── /types                      # TypeScript type definitions
│   └── index.ts                # All data types
├── /config                     # Configuration files
│   └── env.ts                  # Environment variables
├── /data                       # ⚠️ Mock data (remove in production)
│   └── mockData.ts
└── /styles                     # Tailwind CSS styles
    ├── theme.css
    └── fonts.css
```

---

## 🚀 Step-by-Step Export Process

### 1. Export from Figma Make
1. Look for an "Export" or "Download" button in the Figma Make interface
2. Download the complete project as a ZIP file
3. Extract the ZIP to your local development environment

### 2. Set Up Local Development Environment

**Prerequisites:**
- Node.js 18+ and npm/yarn/pnpm
- Git (optional, for version control)

**Initialize the project:**

```bash
# Navigate to your exported project
cd weareout-frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your backend URL
# VITE_API_BASE_URL=http://localhost:3000/api
# VITE_GEMINI_API_KEY=your_key_here
```

### 3. Fix Figma-Specific Imports

The Figma Make environment uses a special `figma:asset` import scheme that won't work outside of Figma. You'll need to:

**Find all figma:asset imports:**
```bash
grep -r "figma:asset" src/
```

**Replace them with standard imports:**
```typescript
// BEFORE (Figma Make):
import img from "figma:asset/abc123.png";

// AFTER (Standard React):
import img from "./assets/abc123.png";
```

**Move assets to public folder:**
- Create `/public/assets` directory
- Copy all image files there
- Update import paths to use relative paths

### 4. Configure Tailwind CSS v4

This project uses Tailwind CSS v4. Ensure your build process supports it:

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
});
```

**postcss.config.js:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

---

## 🔌 Connecting to Your Backend

### Backend API Requirements

Your backend needs to implement these endpoints (see `/src/services/*.service.ts` for full details):

#### **Authentication** (`/auth/*`)
- `POST /auth/signup` - Create user account
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout user

#### **Inventory** (`/inventory/*`)
- `GET /inventory` - Get all items
- `POST /inventory` - Create item
- `PUT /inventory/:id` - Update item
- `DELETE /inventory/:id` - Delete item
- `GET /inventory/search?q=query` - Search items
- `GET /inventory/ai-summary` - Get AI insights

#### **Categories** (`/categories/*`)
- `GET /categories` - Get all categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category
- `PUT /categories/reorder` - Reorder categories

#### **Locations** (`/locations/*`)
- Same structure as categories

#### **Receipts** (`/receipts/*`)
- `POST /receipts/upload` - Upload receipt photo
- `POST /receipts/:id/process` - Process with Gemini Vision
- `POST /receipts/:id/confirm` - Confirm and add to inventory

#### **Shopping List** (`/shopping-list/*`)
- `GET /shopping-list` - Get shopping list
- `POST /shopping-list` - Add item
- `POST /shopping-list/generate` - Auto-generate from low stock

### API Response Format

All endpoints should return this format:

```typescript
{
  "success": true,
  "data": { /* your data */ },
  "error": null,
  "message": "Optional message"
}
```

### Migration Steps

**1. Replace mock data with API calls:**

```typescript
// BEFORE (Dashboard.tsx):
import { mockInventory } from '../data/mockData';
const [inventory, setInventory] = useState(mockInventory);

// AFTER:
import { inventoryService } from '../services';
const [inventory, setInventory] = useState<InventoryItem[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchInventory = async () => {
    try {
      const data = await inventoryService.getAll();
      setInventory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };
  fetchInventory();
}, []);
```

**2. Add loading and error states to UI:**

```typescript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
```

**3. Optional: Use React Query for better data management:**

```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query';

function Dashboard() {
  const { data: inventory, isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.getAll(),
  });
  
  // ... rest of component
}
```

---

## 🧪 Testing the Integration

### 1. Test API Connection
```typescript
// Create a test file: src/services/__tests__/api.test.ts
import { inventoryService } from '../services';

async function testConnection() {
  try {
    const items = await inventoryService.getAll();
    console.log('✅ API connected successfully:', items);
  } catch (error) {
    console.error('❌ API connection failed:', error);
  }
}

testConnection();
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Check Network Tab
- Open browser DevTools → Network tab
- Watch for API calls to your backend
- Verify requests/responses

---

## 📱 Building for Production

### 1. Build the app
```bash
npm run build
```

### 2. Preview production build
```bash
npm run preview
```

### 3. Deploy

**Recommended platforms:**

**Vercel (easiest):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Environment variables:**
- Set `VITE_API_BASE_URL` to your production backend URL
- Set `VITE_GEMINI_API_KEY` in hosting platform settings

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot find module 'figma:asset'"
**Solution:** Replace all `figma:asset` imports with standard relative imports (see Step 3 above)

### Issue: CORS errors when calling backend
**Solution:** Configure CORS on your backend:
```typescript
// Express.js example
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### Issue: Images not loading
**Solution:** 
- Move images to `/public/assets`
- Use paths like `/assets/image.png` in your code
- Or import them: `import img from './assets/image.png'`

### Issue: Tailwind styles not working
**Solution:**
- Ensure Tailwind v4 is installed
- Check `postcss.config.js` exists
- Verify `@import "tailwindcss"` is in your CSS

---

## 📊 Migration Checklist

Use this checklist to track your backend integration:

### Setup
- [ ] Export code from Figma Make
- [ ] Install dependencies locally
- [ ] Configure environment variables
- [ ] Fix figma:asset imports

### Backend Integration
- [ ] Implement authentication endpoints
- [ ] Implement inventory endpoints
- [ ] Implement category/location endpoints
- [ ] Implement receipt processing (with Gemini Vision)
- [ ] Implement shopping list endpoints

### Frontend Migration
- [ ] Replace mock data in Dashboard.tsx
- [ ] Replace mock data in ShoppingList.tsx
- [ ] Replace mock data in Setup.tsx
- [ ] Add loading states to all components
- [ ] Add error handling to all components
- [ ] Test all user flows end-to-end

### Polish
- [ ] Add proper loading spinners
- [ ] Add error boundary components
- [ ] Add offline detection
- [ ] Test on mobile devices
- [ ] Optimize images
- [ ] Add analytics (optional)

### Deployment
- [ ] Build production bundle
- [ ] Deploy to hosting platform
- [ ] Set production environment variables
- [ ] Test production deployment
- [ ] Set up monitoring/error tracking

---

## 🆘 Need Help?

**Key files to review:**
- `/src/services/` - All API endpoints documented
- `/src/types/index.ts` - TypeScript types for your backend
- `/src/data/mockData.ts` - Example data structures

**Backend should return data matching:**
- Type definitions in `/src/types/index.ts`
- Mock data structure in `/src/data/mockData.ts`

---

## 🎯 Next Steps

1. **Set up backend repository** in Claude Code
2. **Implement API endpoints** using the service files as reference
3. **Test locally** with frontend pointing to `http://localhost:3000`
4. **Deploy both** frontend and backend
5. **Connect** frontend to production backend URL

Good luck! 🚀
