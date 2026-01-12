# WeAreOut Mobile - Authentication System

## Overview

Production-ready authentication system for the WeAreOut iOS React Native app with TypeScript support.

## Features

- Full authentication flow (Login, Register, Logout)
- Form validation with real-time feedback
- Token-based authentication with automatic refresh
- Secure token storage using AsyncStorage
- iOS-style UI components
- TypeScript support throughout
- Comprehensive error handling
- Loading states
- Password visibility toggle
- Keyboard-aware forms

## Project Structure

```
src/
├── components/
│   ├── Button.tsx              # Reusable button with variants
│   ├── Input.tsx               # Reusable input with validation
│   └── index.ts                # Component exports
├── contexts/
│   └── AuthContext.tsx         # Auth state management
├── screens/
│   └── auth/
│       ├── LoginScreen.tsx     # Login screen
│       ├── RegisterScreen.tsx  # Registration screen
│       └── index.ts            # Screen exports
├── services/
│   └── api.ts                  # Axios client & API endpoints
├── types/
│   └── auth.ts                 # TypeScript interfaces
└── README.md                   # This file
```

## Components

### Button Component (`components/Button.tsx`)

Reusable button with three variants and loading states.

**Props:**
- `title`: Button text
- `onPress`: Click handler
- `loading`: Show loading spinner (default: false)
- `disabled`: Disable button (default: false)
- `variant`: 'primary' | 'secondary' | 'outline' (default: 'primary')
- `style`: Custom button styles
- `textStyle`: Custom text styles

**Usage:**
```tsx
import {Button} from './src/components';

<Button
  title="Sign In"
  onPress={handleLogin}
  loading={isLoading}
  variant="primary"
/>
```

### Input Component (`components/Input.tsx`)

Reusable text input with label, error display, and password toggle.

**Props:**
- `label`: Input label text
- `error`: Error message to display
- `secureTextEntry`: Enable password mode (default: false)
- Plus all standard TextInput props

**Usage:**
```tsx
import {Input} from './src/components';

<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  keyboardType="email-address"
/>
```

## Context

### AuthContext (`contexts/AuthContext.tsx`)

Provides authentication state and methods throughout the app.

**State:**
- `user`: Current user object or null
- `isLoading`: Loading state for auth operations
- `isAuthenticated`: Boolean authentication status
- `error`: Error message or null

**Methods:**
- `login(credentials)`: Login with email and password
- `register(data)`: Register new user
- `logout()`: Logout current user
- `clearError()`: Clear error state
- `checkAuthStatus()`: Check if user is authenticated

**Usage:**
```tsx
import {useAuth} from './src/contexts/AuthContext';

const MyComponent = () => {
  const {user, isAuthenticated, login, logout} = useAuth();

  // Use auth methods and state
};
```

## Screens

### LoginScreen (`screens/auth/LoginScreen.tsx`)

Full-featured login screen with:
- Email and password inputs
- Form validation
- Error handling
- Loading states
- Navigation to register
- Forgot password placeholder

### RegisterScreen (`screens/auth/RegisterScreen.tsx`)

Registration screen with:
- Full name, email, password, and confirm password
- Password strength validation
- Password requirements display
- Real-time validation
- Navigation to login

## Services

### API Service (`services/api.ts`)

Axios-based API client with:
- Automatic token injection
- Token refresh on 401 errors
- Request queuing during refresh
- Error handling utilities

**Token Management:**
```typescript
import {tokenManager} from './src/services/api';

// Get tokens
const accessToken = await tokenManager.getAccessToken();
const refreshToken = await tokenManager.getRefreshToken();

// Set tokens
await tokenManager.setTokens(accessToken, refreshToken);

// Clear tokens
await tokenManager.clearTokens();
```

**API Calls:**
```typescript
import {authApi} from './src/services/api';

// Login
const response = await authApi.login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const response = await authApi.register({
  fullName: 'John Doe',
  email: 'user@example.com',
  password: 'password123'
});

// Logout
await authApi.logout();
```

**Custom API Calls:**
```typescript
import apiClient from './src/services/api';

// GET request with auto token injection
const data = await apiClient.get('/user/profile');

// POST request
const result = await apiClient.post('/events', eventData);
```

## Types

### TypeScript Interfaces (`types/auth.ts`)

All TypeScript interfaces for authentication:
- `User`: User object structure
- `AuthTokens`: Access and refresh tokens
- `LoginRequest`: Login credentials
- `RegisterRequest`: Registration data
- `LoginResponse`: Login API response
- `RegisterResponse`: Registration API response
- `RefreshTokenRequest`: Refresh token request
- `RefreshTokenResponse`: Refresh token response
- `ApiError`: Error response structure

## Validation Rules

### Email Validation
- Required field
- Valid email format (RFC 5322)

### Password Validation (Login)
- Required field
- Minimum 6 characters

### Password Validation (Register)
- Required field
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Full Name Validation
- Required field
- Minimum 2 characters
- Maximum 50 characters

### Confirm Password Validation
- Required field
- Must match password field

## Error Handling

### Form Errors
- Real-time validation on blur
- Inline error messages below inputs
- Error highlighting with red borders

### API Errors
- Network errors with user-friendly messages
- Validation errors from backend
- Alert dialogs for critical errors
- Automatic error clearing

### Token Errors
- Automatic token refresh on 401
- Logout on refresh token expiration
- Queue management during refresh

## Styling

All components follow iOS Human Interface Guidelines:

**Colors:**
- Primary: `#007AFF` (iOS Blue)
- Background: `#FFFFFF` (White)
- Secondary Background: `#F2F2F7` (Light Gray)
- Text: `#1C1C1E` (Black)
- Secondary Text: `#8E8E93` (Gray)
- Error: `#FF3B30` (Red)
- Border: `#E5E5EA` (Light Gray)

**Typography:**
- Title: 34pt, Bold, -0.5 tracking
- Subtitle: 17pt, Regular, -0.2 tracking
- Body: 16pt, Regular
- Label: 14pt, Semibold
- Error: 13pt, Medium

**Spacing:**
- Container padding: 24px
- Input margin: 20px
- Section spacing: 32-40px
- Button padding: 16px vertical, 24px horizontal

**Border Radius:**
- Inputs/Buttons: 12px
- Cards: 12px

## Security

### Token Storage
- Access tokens stored in AsyncStorage
- Refresh tokens stored in AsyncStorage
- Secure token cleanup on logout

### Password Handling
- Passwords never logged
- Secure text entry for password fields
- No password validation on client for existing passwords

### API Communication
- HTTPS only in production
- Bearer token authentication
- Automatic token refresh
- Request timeout (15 seconds)

### Best Practices
- Input sanitization on backend
- Rate limiting on backend
- Token expiration
- Refresh token rotation (recommended)
- SSL pinning (recommended for production)

## Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] Logout functionality
- [ ] Form validation (all fields)
- [ ] Error handling (network errors)
- [ ] Token refresh on 401
- [ ] Password visibility toggle
- [ ] Navigation between screens
- [ ] Keyboard handling
- [ ] Loading states
- [ ] iOS styling consistency

## Development

### Prerequisites
- Node.js >= 20
- React Native 0.83.1
- iOS/Android development environment

### Installation
See DEPENDENCIES_TO_INSTALL.md

### Running
```bash
# Start metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Production Considerations

1. **Environment Variables**: Use react-native-config or similar
2. **Error Tracking**: Integrate Sentry or similar
3. **Analytics**: Add tracking for auth events
4. **Biometrics**: Add Face ID / Touch ID support
5. **Email Verification**: Implement verification flow
6. **Password Reset**: Implement forgot password
7. **Social Login**: Add OAuth providers
8. **2FA**: Implement two-factor authentication
9. **Session Management**: Handle multiple devices
10. **SSL Pinning**: Secure API communication

## Support

For issues or questions:
1. Check INTEGRATION_GUIDE.md
2. Review DEPENDENCIES_TO_INSTALL.md
3. Check backend API documentation
4. Review error logs in console

## License

Private - WeAreOut Project
