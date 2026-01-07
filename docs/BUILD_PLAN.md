# WeAreOut - Production iOS App Build Plan

**Target:** App Store Shippable v1.0
**Timeline:** Phased development with comprehensive testing
**Quality Standard:** Production-ready, 80%+ test coverage, App Store compliant

---

## Phase 1: Foundation & Infrastructure (Week 1-2)

### 1.1 Backend Foundation (Marco)
**Priority: Critical**

- [ ] **Database Schema Design**
  - Users table (auth, profile)
  - Items table (inventory items)
  - Consumption_logs table (tracking usage)
  - Shopping_lists table
  - Locations table (storage locations)
  - Migrations setup with rollback capability

- [ ] **Authentication System**
  - JWT token generation/validation
  - Refresh token mechanism
  - Password hashing (bcrypt)
  - User registration/login endpoints
  - Password reset flow
  - **Tests:** Unit tests for auth logic, integration tests for endpoints

- [ ] **API Foundation**
  - Express server with TypeScript
  - CORS configuration
  - Request validation middleware
  - Error handling middleware
  - Rate limiting
  - Logging (Winston/Morgan)
  - **Tests:** Middleware tests, error handling tests

- [ ] **Database Connection**
  - PostgreSQL connection pool
  - Migration runner
  - Seed data for development
  - **Tests:** Connection pool tests, migration tests

**Deliverables:**
- ✅ Backend running on localhost:3000
- ✅ Database schema documented
- ✅ API endpoints documented (Swagger/OpenAPI)
- ✅ 80%+ backend test coverage
- ✅ Postman collection for manual testing

---

### 1.2 Mobile App Foundation (Dice)
**Priority: Critical**

- [ ] **React Native Project Setup**
  - Initialize with TypeScript template
  - Configure iOS project (Bundle ID, etc.)
  - Setup folder structure
  - Configure absolute imports (@components, @screens, etc.)

- [ ] **Navigation Structure**
  - React Navigation setup
  - Auth flow (Login, Register, Onboarding)
  - Main app flow (Dashboard, Lists, Settings)
  - Deep linking configuration
  - **Tests:** Navigation flow tests

- [ ] **UI Component Library**
  - Design system foundations (colors, typography, spacing)
  - Base components (Button, Input, Card, etc.)
  - iOS-style components
  - Dark mode support
  - **Tests:** Component snapshot tests

- [ ] **State Management**
  - Context API setup
  - Auth context
  - User context
  - Inventory context
  - **Tests:** Context tests

- [ ] **API Client**
  - Axios/Fetch wrapper
  - Request/response interceptors
  - Token management
  - Error handling
  - **Tests:** API client tests with mocks

**Deliverables:**
- ✅ App runs on iOS Simulator
- ✅ Navigation flows functional
- ✅ Component library documented (Storybook optional)
- ✅ 80%+ mobile test coverage
- ✅ Design system documented

---

## Phase 2: Core Features (Week 3-5)

### 2.1 User Authentication Flow (Marco + Dice)
**Priority: Critical**

**Backend (Marco):**
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/refresh
- [ ] POST /api/auth/logout
- [ ] POST /api/auth/forgot-password
- [ ] POST /api/auth/reset-password
- [ ] GET /api/auth/me
- [ ] **Tests:** Full auth flow integration tests

**Mobile (Dice):**
- [ ] Login screen
- [ ] Registration screen
- [ ] Onboarding flow
- [ ] Forgot password flow
- [ ] Secure token storage (MMKV)
- [ ] **Tests:** Auth flow E2E tests (Detox)

**Integration Tests:**
- [ ] Full registration flow
- [ ] Login/logout flow
- [ ] Token refresh flow
- [ ] Password reset flow

---

### 2.2 Manual Item Entry (Marco + Dice)
**Priority: High**

**Backend (Marco):**
- [ ] POST /api/items - Create item
- [ ] GET /api/items - List user's items
- [ ] GET /api/items/:id - Get single item
- [ ] PUT /api/items/:id - Update item
- [ ] DELETE /api/items/:id - Delete item
- [ ] POST /api/items/:id/deplete - Mark item depleted
- [ ] **Tests:** CRUD operation tests

**Mobile (Dice):**
- [ ] Add item screen (name, quantity, location)
- [ ] Item list view
- [ ] Item detail view
- [ ] Quick deplete action
- [ ] Item edit functionality
- [ ] **Tests:** Item management E2E tests

---

### 2.3 Dashboard & Fuel Gauge View (Dice)
**Priority: High**

- [ ] Dashboard screen with item cards
- [ ] Fuel gauge visualization (Green/Yellow/Red)
- [ ] "Days remaining" display
- [ ] Low stock alerts
- [ ] Group by category view
- [ ] Group by location view
- [ ] Pull-to-refresh
- [ ] **Tests:** Dashboard rendering tests, interaction tests

---

### 2.4 Shopping List (Marco + Dice)
**Priority: High**

**Backend (Marco):**
- [ ] POST /api/shopping-lists - Create list
- [ ] GET /api/shopping-lists - Get lists
- [ ] POST /api/shopping-lists/:id/items - Add item to list
- [ ] DELETE /api/shopping-lists/:id/items/:itemId - Remove from list
- [ ] PUT /api/shopping-lists/:id/items/:itemId/check - Mark as purchased
- [ ] **Tests:** Shopping list CRUD tests

**Mobile (Dice):**
- [ ] Shopping list screen
- [ ] Add/remove items
- [ ] Check off items
- [ ] Share list functionality
- [ ] **Tests:** Shopping list E2E tests

---

## Phase 3: AI Features (Week 6-8)

### 3.1 Gemini Vision Integration (Marco + Dice)
**Priority: High**

**Backend (Marco):**
- [ ] Gemini API client setup
- [ ] POST /api/vision/analyze-photo - Process pantry/fridge photo
- [ ] POST /api/vision/analyze-receipt - OCR receipt
- [ ] Image upload/storage (S3 or similar)
- [ ] Parse Gemini response to structured data
- [ ] **Tests:** Gemini API mock tests, parsing tests

**Mobile (Dice):**
- [ ] Camera integration (React Native Vision Camera)
- [ ] Photo capture UI
- [ ] Receipt scan flow
- [ ] Pantry scan flow
- [ ] Loading states during AI processing
- [ ] Results review screen
- [ ] **Tests:** Camera flow tests

---

### 3.2 Email Receipt Scraping (Marco)
**Priority: Medium**

- [ ] Gmail OAuth2 setup
- [ ] Gmail API client
- [ ] Receipt detection logic
- [ ] Parse common receipt formats (Amazon, Instacart, etc.)
- [ ] Background job for periodic checking
- [ ] POST /api/receipts/connect-gmail - OAuth flow
- [ ] GET /api/receipts/sync - Manual sync trigger
- [ ] **Tests:** Email parsing tests, OAuth flow tests

---

### 3.3 Consumption Intelligence (Marco)
**Priority: High**

- [ ] Burn rate calculation algorithm
- [ ] Time-to-empty prediction
- [ ] Confidence score calculation
- [ ] GET /api/items/:id/predictions - Get predictions
- [ ] Background job for updating predictions
- [ ] **Tests:** Algorithm tests with various scenarios

---

## Phase 4: Professional Polish (Week 9-10)

### 4.1 Testing & Quality Assurance
**Priority: Critical**

- [ ] Achieve 80%+ test coverage (backend)
- [ ] Achieve 80%+ test coverage (mobile)
- [ ] E2E test suite complete (Detox)
- [ ] Performance testing
- [ ] Security audit
- [ ] Accessibility audit (VoiceOver support)
- [ ] Error tracking setup (Sentry)
- [ ] Analytics setup (basic events)

---

### 4.2 Monetization Setup (Dice + Marco)
**Priority: Critical**

**Mobile (Dice):**
- [ ] RevenueCat SDK integration
- [ ] Paywall screen
- [ ] Subscription purchase flow
- [ ] Restore purchases
- [ ] Free tier limitations UI

**Backend (Marco):**
- [ ] RevenueCat webhook endpoint
- [ ] Subscription status validation
- [ ] Feature gating based on subscription
- [ ] **Tests:** Monetization flow tests

---

### 4.3 Push Notifications (Marco + Dice)
**Priority: Medium**

**Backend (Marco):**
- [ ] Firebase Cloud Messaging setup
- [ ] Notification scheduling service
- [ ] POST /api/notifications/register-device
- [ ] Low stock alert triggers

**Mobile (Dice):**
- [ ] Push notification permissions
- [ ] Notification handling
- [ ] Deep linking from notifications

---

### 4.4 UI/UX Polish (Dice)
**Priority: High**

- [ ] App icon design
- [ ] Splash screen
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Animations and transitions
- [ ] iOS-specific UI polish
- [ ] Dark mode polish
- [ ] Haptic feedback

---

## Phase 5: App Store Preparation (Week 11-12)

### 5.1 App Store Assets
**Priority: Critical**

- [ ] App icon (1024x1024)
- [ ] Screenshots (all required sizes)
  - 6.7" (iPhone 14 Pro Max)
  - 6.5" (iPhone 11 Pro Max)
  - 5.5" (iPhone 8 Plus)
- [ ] App preview video (optional but recommended)
- [ ] App Store description
- [ ] Keywords research
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Support URL

---

### 5.2 Final Testing
**Priority: Critical**

- [ ] TestFlight beta testing
- [ ] User acceptance testing
- [ ] Bug fixes from beta
- [ ] Performance optimization
- [ ] Final security review
- [ ] Final accessibility review

---

### 5.3 App Store Submission
**Priority: Critical**

- [ ] App Store Connect account setup
- [ ] Build uploaded to App Store Connect
- [ ] App information complete
- [ ] Screenshots uploaded
- [ ] Privacy details filled
- [ ] App review information
- [ ] Submit for review

---

## Testing Standards

### Backend Testing
```
Unit Tests: 80%+ coverage
- All business logic functions
- Utility functions
- Service layer

Integration Tests: Key flows
- Auth flows
- CRUD operations
- External API integrations

API Tests:
- All endpoints tested
- Success cases
- Error cases
- Edge cases
```

### Mobile Testing
```
Unit Tests: 80%+ coverage
- Components
- Hooks
- Utilities
- State management

Integration Tests:
- Screen flows
- API integration
- State updates

E2E Tests (Detox):
- Critical user flows
- Auth flow
- Item management
- Photo scanning
- Shopping list
```

---

## Code Quality Standards

### All Code
- TypeScript strict mode
- ESLint (no errors)
- Prettier formatting
- Pre-commit hooks (Husky)
- Code reviews required

### Backend
- OpenAPI/Swagger documentation
- Database migration documentation
- Error logging with context
- Request validation
- Security headers

### Mobile
- Accessibility labels
- Localization ready
- Performance optimized
- Memory leak free
- iOS guidelines compliant

---

## CI/CD Pipeline

### GitHub Actions Workflows

**Pull Request:**
- Lint check
- Type check
- Unit tests
- Integration tests
- Build verification

**Main Branch:**
- All PR checks
- E2E tests
- Build artifacts
- Deploy to TestFlight (manual trigger)

**Release:**
- Full test suite
- Build production app
- Upload to App Store Connect
- Create release notes

---

## Success Metrics

### Phase 1-2 (Foundation)
- All tests passing
- Backend API functional
- Mobile app navigable
- Authentication working

### Phase 3 (Core Features)
- All CRUD operations working
- AI features integrated
- User can manage inventory

### Phase 4 (Polish)
- 80%+ test coverage achieved
- Monetization functional
- No critical bugs
- Performance acceptable

### Phase 5 (Launch)
- App Store approved
- TestFlight feedback addressed
- Ready for public release

---

## Agent Responsibilities

### Gus (Coordinator)
- Break down features into tasks
- Ensure PRD compliance
- Coordinate Marco and Dice
- Track overall progress
- Identify blockers
- Store learnings in RAG

### Marco (Backend)
- Build all API endpoints
- Design database schema
- Implement integrations (Gemini, Gmail)
- Write backend tests
- API documentation
- Store backend patterns in RAG

### Dice (Mobile/Frontend)
- Build iOS app with React Native
- Create UI components
- Implement app flows
- Write mobile tests
- Ensure iOS guidelines compliance
- Store mobile patterns in RAG

---

## Next Steps

1. **Gus**: Create detailed task breakdown for Phase 1
2. **Marco**: Set up backend project structure
3. **Dice**: Initialize React Native project
4. **All**: Daily sync to track progress and blockers

---

**Build Start Date:** TBD
**Target Launch:** Q1 2026
**Quality Bar:** Production-ready, App Store compliant, 80%+ tested
