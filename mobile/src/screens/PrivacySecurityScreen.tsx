import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';

export const PrivacySecurityScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [shareUsageData, setShareUsageData] = useState(true);

  const handleToggleTwoFactor = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'This feature will be available soon!',
        [{ text: 'OK' }]
      );
    } else {
      setTwoFactorEnabled(value);
    }
  };

  const handleToggleBiometrics = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable Biometric Authentication',
        'This feature will be available soon!',
        [{ text: 'OK' }]
      );
    } else {
      setBiometricsEnabled(value);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SECURITY</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>
                  Add an extra layer of security to your account
                </Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleToggleTwoFactor}
                trackColor={{
                  false: theme.colors.gray[300],
                  true: theme.colors.primary[500],
                }}
                thumbColor={theme.colors.background}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Biometric Authentication</Text>
                <Text style={styles.settingDescription}>
                  Use Face ID or Touch ID to unlock the app
                </Text>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={handleToggleBiometrics}
                trackColor={{
                  false: theme.colors.gray[300],
                  true: theme.colors.primary[500],
                }}
                thumbColor={theme.colors.background}
              />
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Alert.alert('Active Sessions', 'This feature will be available soon!');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Active Sessions</Text>
              <Text style={styles.menuItemIcon}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PRIVACY</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Share Analytics</Text>
                <Text style={styles.settingDescription}>
                  Help us improve by sharing anonymous usage data
                </Text>
              </View>
              <Switch
                value={shareAnalytics}
                onValueChange={setShareAnalytics}
                trackColor={{
                  false: theme.colors.gray[300],
                  true: theme.colors.primary[500],
                }}
                thumbColor={theme.colors.background}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Share Usage Data</Text>
                <Text style={styles.settingDescription}>
                  Help us understand how you use the app
                </Text>
              </View>
              <Switch
                value={shareUsageData}
                onValueChange={setShareUsageData}
                trackColor={{
                  false: theme.colors.gray[300],
                  true: theme.colors.primary[500],
                }}
                thumbColor={theme.colors.background}
              />
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Alert.alert('Data Export', 'This feature will be available soon!');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Export My Data</Text>
              <Text style={styles.menuItemIcon}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Legal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LEGAL</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Alert.alert('Privacy Policy', 'This feature will be available soon!');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Privacy Policy</Text>
              <Text style={styles.menuItemIcon}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Alert.alert('Terms of Service', 'This feature will be available soon!');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Terms of Service</Text>
              <Text style={styles.menuItemIcon}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Alert.alert('Licenses', 'This feature will be available soon!');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Open Source Licenses</Text>
              <Text style={styles.menuItemIcon}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: theme.colors.text.primary,
    fontWeight: '300',
  },
  headerTitle: {
    ...theme.typography.styles.h4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: 0.5,
    paddingHorizontal: theme.spacing[6],
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[5],
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingContent: {
    flex: 1,
    marginRight: theme.spacing[4],
  },
  settingLabel: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  settingDescription: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[5],
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
  },
  menuItemIcon: {
    fontSize: 24,
    color: theme.colors.text.secondary,
  },
  bottomPadding: {
    height: 40,
  },
});
