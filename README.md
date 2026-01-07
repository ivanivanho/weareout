# WeAreOut

**Personal Inventory Concierge for iOS**

> "Never run out of essentials again"

[![iOS](https://img.shields.io/badge/iOS-15.0+-blue.svg)](https://www.apple.com/ios/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-61DAFB.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest%20%2B%20Detox-green.svg)](https://jestjs.io/)

## Project Overview

WeAreOut is a production-ready iOS application designed to eliminate the mental burden of household inventory management. Built with professional code standards, comprehensive testing, and App Store monetization.

### Vision
A "zero-friction" world where users never have to remember to buy essentials—the app remembers for them.

## 🏗️ Architecture

### Production Stack

**Mobile App (iOS Primary)**
- React Native 0.73+ with TypeScript (strict mode)
- React Navigation for routing
- React Native MMKV for encrypted local storage
- React Native Vision Camera + Gemini Vision API
- RevenueCat for subscription management

**Backend API**
- Node.js 20+ with Express
- PostgreSQL 15+ with connection pooling
- Gemini AI API (Vision + Embeddings)
- OAuth2 (Gmail API) for receipt scraping
- JWT authentication with refresh tokens

**Testing & Quality**
- Jest (Unit + Integration tests, 80%+ coverage)
- Detox (E2E tests for iOS)
- ESLint + Prettier + TypeScript strict
- Husky pre-commit hooks
- GitHub Actions CI/CD

**Monetization**
- RevenueCat integration
- In-app subscriptions
- Freemium model ready

## 📁 Project Structure

```
weareout/
├── mobile/                    # React Native iOS app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── screens/          # App screens
│   │   ├── navigation/       # Navigation configuration
│   │   ├── services/         # API clients, Gemini integration
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utilities and helpers
│   │   ├── types/            # TypeScript type definitions
│   │   └── config/           # App configuration
│   ├── __tests__/            # Unit and integration tests
│   ├── e2e/                  # Detox E2E tests
│   ├── ios/                  # Native iOS code
│   └── package.json
│
├── backend/                   # Node.js API
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/      # Business logic
│   │   ├── models/           # Database models
│   │   ├── services/         # External services (Gemini, Gmail)
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── utils/            # Utilities
│   │   └── server.js         # Express app entry
│   ├── tests/                # Backend tests
│   ├── database/
│   │   ├── migrations/       # Database migrations
│   │   └── seeds/            # Seed data
│   └── package.json
│
├── shared/                    # Shared TypeScript types
├── docs/                      # Documentation
│   ├── architecture/         # Architecture decisions
│   ├── api/                  # API documentation
│   └── app-store/            # App Store assets
├── .github/
│   └── workflows/            # CI/CD pipelines
├── PRD.md                    # Product Requirements
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

```bash
# Required
- Node.js 20+
- npm or yarn
- Xcode 15+ (for iOS development)
- PostgreSQL 15+
- CocoaPods

# Recommended
- iOS Simulator or physical device
- Gemini API key
- Gmail API credentials (for receipt scraping)
```

### Installation

```bash
# Clone and setup
cd /Users/ivs/weareout

# Install backend dependencies
cd backend
npm install

# Install mobile dependencies
cd ../mobile
npm install
cd ios && pod install && cd ..

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Development

```bash
# Terminal 1: Start PostgreSQL
# (via Postgres.app or: brew services start postgresql)

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start iOS app
cd mobile
npm run ios
```

## 🧪 Testing

### Unit & Integration Tests

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Mobile tests
cd mobile
npm test
npm run test:coverage
```

### End-to-End Tests

```bash
# Build app for testing
cd mobile
npm run e2e:build:ios

# Run E2E tests
npm run e2e:test:ios
```

### Code Quality

```bash
# Lint
npm run lint

# Type check
npm run typecheck

# Format
npm run format
```

## 📦 Phase 1 - SLC Features

**Core Functionality**
- ✅ User authentication (JWT)
- ✅ Email receipt scraping (OAuth2 Gmail)
- ✅ Gemini Vision photo recognition
  - Pantry/fridge scanning
  - Physical receipt OCR
- ✅ Manual item depletion logging
- ✅ Consumption intelligence (burn rate)
- ✅ Shopping list generation
- ✅ Dashboard with fuel gauge view
- ✅ Location tagging
- ✅ Push notifications

**Professional Requirements**
- ✅ 80%+ test coverage
- ✅ TypeScript strict mode
- ✅ Error tracking (Sentry ready)
- ✅ Analytics (ready for integration)
- ✅ Encrypted data storage
- ✅ GDPR compliance ready
- ✅ App Store guidelines compliant

## 💰 Monetization Strategy

### Freemium Model

**Free Tier**
- Up to 50 items
- Basic consumption tracking
- Manual entry only

**Premium ($4.99/month or $49.99/year)**
- Unlimited items
- Email receipt scraping
- Photo recognition (Gemini Vision)
- Predictive alerts
- Multi-household support (Phase 2)
- Priority support

**Implementation**
- RevenueCat for subscription management
- In-app purchase integration
- Paywall UI components
- Restore purchases functionality

## 🎯 App Store Submission Checklist

- [ ] App Store Connect account setup
- [ ] App icon (1024x1024)
- [ ] Screenshots (all required sizes)
- [ ] App Store description
- [ ] Privacy policy
- [ ] Terms of service
- [ ] App review notes
- [ ] TestFlight beta testing
- [ ] App Store optimization (ASO)

## 📊 Development with Agent Team

This project is built with AI agents:
- **Gus** (Coordinator) - Plans features, ensures PRD compliance
- **Marco** (Backend) - Builds APIs, database, integrations
- **Dice** (Frontend/Mobile) - Creates iOS UI, components

All development tracked with:
- Full observability
- RAG-enhanced best practices
- Automated learning and improvement

## 🔐 Security & Privacy

- End-to-end encryption for sensitive data
- Secure OAuth2 flows
- No PII logging
- HTTPS/TLS only
- Regular security audits

## 📝 Documentation

- [PRD](./PRD.md) - Complete Product Requirements
- [API Documentation](./docs/api/) - Backend API reference
- [Architecture](./docs/architecture/) - System design docs
- [Contributing](./CONTRIBUTING.md) - Development guidelines

## 📄 License

Proprietary - All rights reserved

---

**Status:** Phase 1 - Production Build in Progress
**Target:** App Store Launch Q1 2026
**Version:** 0.1.0
