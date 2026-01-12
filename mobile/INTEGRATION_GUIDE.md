# Authentication Integration Guide

## Overview

This guide explains how to integrate the authentication system into your WeAreOut React Native app.

## File Structure

```
/Users/ivs/weareout/mobile/src/
├── components/
│   ├── Button.tsx          # Reusable button component
│   └── Input.tsx           # Reusable input component
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── screens/
│   └── auth/
│       ├── LoginScreen.tsx     # Login screen
│       └── RegisterScreen.tsx  # Registration screen
├── services/
│   └── api.ts             # Axios client with token management
└── types/
    └── auth.ts            # TypeScript interfaces
```

## Integration Steps

### 1. Install Dependencies

```bash
npm install axios @react-native-async-storage/async-storage @react-navigation/native @react-navigation/native-stack react-native-screens
```

For iOS:
```bash
cd ios && pod install && cd ..
```

### 2. Update App.tsx

Replace your current App.tsx with the following:

```typescript
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthProvider, useAuth} from './src/contexts/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
// Import your main app screens here
// import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    {/* Add your authenticated screens here */}
    {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
  </Stack.Navigator>
);

const RootNavigator = () => {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    // You can replace this with a custom splash screen
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
};

export default App;
```

### 3. Configure API Endpoints

Update the API base URL in `/Users/ivs/weareout/mobile/src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'  // Update with your backend URL
  : 'https://api.weareout.com/api';
```

### 4. Backend API Requirements

Your backend must provide these endpoints:

#### POST /api/auth/register
Request:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "fullName": "John Doe",
    "createdAt": "2026-01-06T00:00:00.000Z",
    "updatedAt": "2026-01-06T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### POST /api/auth/login
Request:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response: Same as register

#### POST /api/auth/refresh
Request:
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Response:
```json
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "new-jwt-refresh-token"
}
```

#### POST /api/auth/logout
Request: Bearer token in Authorization header
Response: 204 No Content

### 5. Using the Auth Context

In any component, you can access authentication state:

```typescript
import {useAuth} from './src/contexts/AuthContext';

const MyComponent = () => {
  const {user, isAuthenticated, login, logout} = useAuth();

  return (
    <View>
      {isAuthenticated && <Text>Welcome, {user?.fullName}!</Text>}
    </View>
  );
};
```

### 6. Protected API Requests

The API client automatically handles authentication:

```typescript
import apiClient from './src/services/api';

// This request will automatically include the auth token
const fetchUserData = async () => {
  const response = await apiClient.get('/user/profile');
  return response.data;
};
```

## Features

### LoginScreen
- Email and password validation
- Real-time error display
- Loading states
- Navigation to register
- Forgot password placeholder
- iOS-style design with proper keyboard handling

### RegisterScreen
- Full name, email, password, and confirm password fields
- Comprehensive password requirements validation
- Real-time validation feedback
- Password strength requirements display
- Navigation to login
- iOS-style design

### Input Component
- Reusable text input with labels
- Error message display
- Secure text entry for passwords
- Toggle password visibility
- Focus states
- iOS styling

### Button Component
- Three variants: primary, secondary, outline
- Loading state with spinner
- Disabled state
- Customizable styles
- iOS styling with shadows

### API Service
- Axios client with interceptors
- Automatic token management
- Token refresh on 401 errors
- Request queuing during token refresh
- Comprehensive error handling
- TypeScript support

### AuthContext
- Centralized auth state management
- Login, register, and logout functions
- Token storage with AsyncStorage
- Loading and error states
- Auto-check authentication on app start

## Testing

### Test Login Flow
1. Start your backend server
2. Run the app: `npm run ios` or `npm run android`
3. Navigate to RegisterScreen
4. Create a new account
5. Verify auto-login after registration

### Test Token Refresh
1. Login to the app
2. Wait for access token to expire (or manually expire it)
3. Make an authenticated request
4. Verify automatic token refresh

## Customization

### Styling
All styles use iOS design guidelines. To customize:
- Update colors in component StyleSheet
- Modify font sizes and weights
- Adjust spacing and borders

### Validation Rules
Update validation functions in LoginScreen and RegisterScreen:
- `validateEmail()` - Email format validation
- `validatePassword()` - Password strength requirements
- `validateFullName()` - Name validation rules

### API Error Handling
Customize error messages in `/Users/ivs/weareout/mobile/src/services/api.ts`:
- Update `handleApiError()` function
- Modify error response parsing
- Add custom error types

## Troubleshooting

### "Network request failed"
- Ensure backend is running
- Check API_BASE_URL configuration
- For iOS simulator, use `http://localhost:3000`
- For Android emulator, use `http://10.0.2.2:3000`

### "Unable to resolve module"
- Run `npm install`
- Clear cache: `npm start -- --reset-cache`
- Rebuild: `cd ios && pod install && cd ..`

### AsyncStorage errors
- Ensure AsyncStorage is properly linked
- Check pod installation for iOS
- Verify Android gradle sync

## Production Checklist

- [ ] Update API_BASE_URL to production endpoint
- [ ] Implement proper error logging (Sentry, etc.)
- [ ] Add biometric authentication (optional)
- [ ] Implement forgot password flow
- [ ] Add email verification
- [ ] Set up proper token expiration times
- [ ] Add refresh token rotation
- [ ] Implement rate limiting on backend
- [ ] Add input sanitization
- [ ] Test on physical devices
- [ ] Enable SSL pinning for API requests
- [ ] Add proper analytics tracking

## Next Steps

1. Implement protected screens (Home, Profile, etc.)
2. Add forgot password functionality
3. Implement email verification
4. Add social login (Google, Apple)
5. Implement biometric authentication
6. Add user profile editing
7. Set up push notifications
8. Add proper error tracking
