import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ItemDetailScreen } from './src/screens/ItemDetailScreen';
import { ShoppingListScreen } from './src/screens/ShoppingListScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { AddEditInventoryScreen } from './src/screens/AddEditInventoryScreen';
import { BulkEditScreen } from './src/screens/BulkEditScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PrivacySecurityScreen } from './src/screens/PrivacySecurityScreen';
import { LocationsScreen } from './src/screens/LocationsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { VoiceUpdateScreen } from './src/screens/VoiceUpdateScreen';
import { AIResultPreviewScreen } from './src/screens/AIResultPreviewScreen';
import { InventoryUpdateModal } from './src/components/InventoryUpdateModal';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function MainTabs() {
  const [showInventoryUpdate, setShowInventoryUpdate] = useState(false);
  const navigation = useNavigation<StackNavigationProp<any>>();

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 90,
            paddingBottom: 30,
            paddingTop: 10,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E5EA',
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
        }}
      >
        <Tab.Screen
          name="DashboardTab"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Inventory',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24 }}>📦</Text>
            ),
          }}
        />
        <Tab.Screen
          name="AddTab"
          component={View}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowInventoryUpdate(true);
            },
          }}
          options={{
            tabBarLabel: '',
            tabBarIcon: () => (
              <View style={styles.addButtonContainer}>
                <View style={styles.addButton}>
                  <Text style={styles.addButtonText}>+</Text>
                </View>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="SetupTab"
          component={SetupScreen}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24 }}>⚙️</Text>
            ),
          }}
        />
      </Tab.Navigator>

      <InventoryUpdateModal
        visible={showInventoryUpdate}
        onClose={() => setShowInventoryUpdate(false)}
        onScanCamera={() => {
          console.log('Scan with camera');
          setShowInventoryUpdate(false);
        }}
        onVoiceUpdate={() => {
          setShowInventoryUpdate(false);
          navigation.navigate('VoiceUpdate');
        }}
        onChoosePhotos={() => {
          console.log('Choose from photos');
          setShowInventoryUpdate(false);
        }}
        onManualEntry={() => {
          console.log('Manual entry');
          setShowInventoryUpdate(false);
          navigation.navigate('AddEditInventory', { mode: 'add' });
        }}
      />
    </>
  );
}

// Main Stack Navigator (includes modals and detail screens)
function MainNavigator() {
  // Skip onboarding in development mode
  const [showOnboarding, setShowOnboarding] = useState(!__DEV__);

  if (showOnboarding) {
    return (
      <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddEditInventory"
        component={AddEditInventoryScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BulkEdit"
        component={BulkEditScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Locations"
        component={LocationsScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VoiceUpdate"
        component={VoiceUpdateScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AIResultPreview"
        component={AIResultPreviewScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// App Content (handles auth state)
function AppContent() {
  const { user, login, isLoading } = useAuth();
  const [autoLoginDone, setAutoLoginDone] = React.useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = React.useState(false);

  // Auto-login for development with timeout
  React.useEffect(() => {
    if (autoLoginAttempted) return;

    const autoLogin = async () => {
      if (__DEV__) {
        console.log('🚀 [App] Starting auto-login...');
        setAutoLoginAttempted(true);

        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.log('⏱️ [App] Auto-login timeout - proceeding anyway');
          setAutoLoginDone(true);
        }, 5000);

        try {
          // Clear any existing expired tokens first
          const { tokenManager } = await import('./src/services/api');
          await tokenManager.clearTokens();
          console.log('🚀 [App] Cleared existing tokens');

          await login({
            email: 'test@weareout.com',
            password: 'password123',
          });
          console.log('🚀 [App] Auto-login completed successfully');
          clearTimeout(timeoutId);
          setAutoLoginDone(true);
        } catch (error) {
          console.log('❌ [App] Auto-login failed:', error);
          clearTimeout(timeoutId);
          setAutoLoginDone(true);
        }
      } else {
        setAutoLoginDone(true);
      }
    };

    autoLogin();
  }, [autoLoginAttempted, login]);

  // For development, show main app directly after auto-login
  // In production, this would check if user is authenticated
  const isAuthenticated = !!user;

  // Show loading during auto-login
  if (!autoLoginDone) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <Text style={{ fontSize: 18, color: '#000000', marginBottom: 10 }}>Loading...</Text>
        <Text style={{ fontSize: 14, color: '#666666' }}>Connecting to backend...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// Root App Component
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
});
