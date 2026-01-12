# Required Dependencies for Authentication

## Installation Instructions

Run the following commands to install the required dependencies:

```bash
# Core dependencies
npm install axios @react-native-async-storage/async-storage

# Navigation (if not already installed)
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# TypeScript types
npm install --save-dev @types/react-navigation
```

## Dependencies Overview

### Production Dependencies
- **axios** (^1.6.0): HTTP client for API requests with interceptors
- **@react-native-async-storage/async-storage** (^1.21.0): Local storage for tokens
- **@react-navigation/native** (^6.1.0): Navigation framework
- **@react-navigation/native-stack** (^6.9.0): Stack navigator
- **react-native-screens** (^3.29.0): Native screen optimization
- **react-native-safe-area-context** (already installed): Safe area handling

### Dev Dependencies
- **@types/react-navigation**: TypeScript types for navigation

## Post-Installation Steps

1. **iOS Setup** (if on macOS):
   ```bash
   cd ios && pod install && cd ..
   ```

2. **Link AsyncStorage** (for older React Native versions):
   ```bash
   npx react-native link @react-native-async-storage/async-storage
   ```

3. **Update App.tsx** to include the AuthProvider and navigation setup

## API Configuration

Update the API_BASE_URL in `/Users/ivs/weareout/mobile/src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'  // Your local backend
  : 'https://api.weareout.com/api';  // Your production backend
```

## Usage Example

See the example App.tsx setup in the INTEGRATION_GUIDE.md file.
