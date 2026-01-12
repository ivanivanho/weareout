# Quick Reference - WeAreOut Authentication System

## Installation (5 minutes)

```bash
# 1. Install dependencies
npm install axios @react-native-async-storage/async-storage @react-navigation/native @react-navigation/native-stack react-native-screens

# 2. iOS only - install pods
cd ios && pod install && cd ..

# 3. Update API URL in src/services/api.ts
# Change: const API_BASE_URL = 'http://localhost:3000/api'

# 4. Run the app
npm run ios
```

## File Locations

### Components
- `/Users/ivs/weareout/mobile/src/components/Input.tsx` - Text input
- `/Users/ivs/weareout/mobile/src/components/Button.tsx` - Button

### Screens
- `/Users/ivs/weareout/mobile/src/screens/auth/LoginScreen.tsx` - Login
- `/Users/ivs/weareout/mobile/src/screens/auth/RegisterScreen.tsx` - Register

### Core
- `/Users/ivs/weareout/mobile/src/contexts/AuthContext.tsx` - Auth state
- `/Users/ivs/weareout/mobile/src/services/api.ts` - API client
- `/Users/ivs/weareout/mobile/src/types/auth.ts` - TypeScript types

## Usage Examples

### 1. Wrap App with AuthProvider

```typescript
// App.tsx
import {AuthProvider} from './src/contexts/AuthContext';

const App = () => (
  <AuthProvider>
    {/* Your navigation */}
  </AuthProvider>
);
```

### 2. Use Auth in Components

```typescript
import {useAuth} from './src/contexts/AuthContext';

const MyComponent = () => {
  const {user, isAuthenticated, login, logout} = useAuth();

  return (
    <View>
      {isAuthenticated && <Text>Hello {user?.fullName}</Text>}
    </View>
  );
};
```

### 3. Make Authenticated API Calls

```typescript
import apiClient from './src/services/api';

const fetchData = async () => {
  const response = await apiClient.get('/protected-endpoint');
  return response.data;
};
```

### 4. Use Components

```typescript
import {Input, Button} from './src/components';

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>

<Button
  title="Submit"
  onPress={handleSubmit}
  loading={isLoading}
/>
```

## Backend API Requirements

Your backend must implement these endpoints:

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

See INTEGRATION_GUIDE.md for request/response formats.

## Navigation Setup

```typescript
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LoginScreen, RegisterScreen} from './src/screens/auth';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);
```

## Validation Rules

### Email
- Required
- Valid email format

### Password (Login)
- Required
- Min 6 characters

### Password (Register)
- Required
- Min 8 characters
- One uppercase letter
- One lowercase letter
- One number

### Full Name
- Required
- 2-50 characters

## Common Issues

### "Network request failed"
- Check backend is running
- Verify API_BASE_URL in api.ts
- iOS: use `http://localhost:3000`
- Android: use `http://10.0.2.2:3000`

### "Unable to resolve module"
- Run: `npm install`
- Clear cache: `npm start -- --reset-cache`
- iOS: `cd ios && pod install && cd ..`

### AsyncStorage errors
- Ensure AsyncStorage is installed
- iOS: `cd ios && pod install`
- Android: Rebuild the app

## Documentation

- **Full Guide**: `INTEGRATION_GUIDE.md`
- **Dependencies**: `DEPENDENCIES_TO_INSTALL.md`
- **API Docs**: `src/README.md`
- **Summary**: `AUTH_SYSTEM_SUMMARY.md`

## Testing Checklist

- [ ] Install dependencies
- [ ] Configure API URL
- [ ] Wrap app with AuthProvider
- [ ] Test registration
- [ ] Test login
- [ ] Test logout
- [ ] Test form validation
- [ ] Test error handling
- [ ] Test on physical device

## Production TODO

- [ ] Update API URL to production
- [ ] Add error tracking (Sentry)
- [ ] Implement forgot password
- [ ] Add email verification
- [ ] Enable SSL pinning
- [ ] Add biometric auth
- [ ] Test on multiple devices
- [ ] Add analytics tracking

## Support

If you need help:
1. Check `INTEGRATION_GUIDE.md`
2. Review `src/README.md`
3. Check backend logs
4. Review console errors
