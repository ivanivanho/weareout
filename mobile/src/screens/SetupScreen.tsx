import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';

export const SetupScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handleViewTutorial = () => {
    Alert.alert('Tutorial', 'Tutorial feature coming soon!');
  };

  const handleAdjustDetails = () => {
    navigation.navigate('BulkEdit');
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handlePrivacy = () => {
    navigation.navigate('PrivacySecurity');
  };

  const handleEmailReceipts = () => {
    Alert.alert('Email Receipts', 'Email receipt setup coming in Phase 3!');
  };

  const handleLocations = () => {
    navigation.navigate('Locations');
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handlePushNotifications = () => {
    handleNotifications();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Setup</Text>
          <Text style={styles.subtitle}>Manage your preferences</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleViewTutorial}
              activeOpacity={0.8}
            >
              <Text style={styles.quickActionButtonText}>Get Started (View Tutorial)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionSecondary}
              onPress={handleAdjustDetails}
              activeOpacity={0.7}
            >
              <Text style={styles.quickActionIcon}>⚙️</Text>
              <Text style={styles.quickActionSecondaryText}>Add & Adjust Details</Text>
            </TouchableOpacity>
          </View>

          {/* Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>

            <View style={styles.settingsCard}>
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={handleProfile}
                activeOpacity={0.7}
              >
                <View style={styles.settingsItemLeft}>
                  <View style={[styles.settingsIcon, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={styles.settingsIconText}>👤</Text>
                  </View>
                  <View style={styles.settingsContent}>
                    <Text style={styles.settingsTitle}>Profile</Text>
                    <Text style={styles.settingsSubtitle}>Name, email, preferences</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.settingsItem}
                onPress={handlePrivacy}
                activeOpacity={0.7}
              >
                <View style={styles.settingsItemLeft}>
                  <View style={[styles.settingsIcon, { backgroundColor: '#F3E8FF' }]}>
                    <Text style={styles.settingsIconText}>🛡️</Text>
                  </View>
                  <View style={styles.settingsContent}>
                    <Text style={styles.settingsTitle}>Privacy & Security</Text>
                    <Text style={styles.settingsSubtitle}>Data handling, permissions</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Integrations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INTEGRATIONS</Text>

            <View style={styles.settingsCard}>
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={handleEmailReceipts}
                activeOpacity={0.7}
              >
                <View style={styles.settingsItemLeft}>
                  <View style={[styles.settingsIcon, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={styles.settingsIconText}>📧</Text>
                  </View>
                  <View style={styles.settingsContent}>
                    <Text style={styles.settingsTitle}>Email Receipts</Text>
                    <Text style={styles.settingsSubtitle}>Connect email for auto-tracking</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.settingsItem}
                onPress={handleLocations}
                activeOpacity={0.7}
              >
                <View style={styles.settingsItemLeft}>
                  <View style={[styles.settingsIcon, { backgroundColor: '#FED7AA' }]}>
                    <Text style={styles.settingsIconText}>📍</Text>
                  </View>
                  <View style={styles.settingsContent}>
                    <Text style={styles.settingsTitle}>Locations</Text>
                    <Text style={styles.settingsSubtitle}>Manage storage locations</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

            <View style={styles.settingsCard}>
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={handlePushNotifications}
                activeOpacity={0.7}
              >
                <View style={styles.settingsItemLeft}>
                  <View style={[styles.settingsIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={styles.settingsIconText}>🔔</Text>
                  </View>
                  <View style={styles.settingsContent}>
                    <Text style={styles.settingsTitle}>Push Notifications</Text>
                    <Text style={styles.settingsSubtitle}>Low stock alerts, reminders</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.styles.h1,
    marginBottom: theme.spacing[1],
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[6],
  },
  sectionTitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: theme.spacing[4],
  },
  quickActionButton: {
    paddingVertical: theme.spacing[5],
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
  },
  quickActionButtonText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.background,
    fontSize: 16,
  },
  quickActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    paddingVertical: theme.spacing[5],
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.xl,
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionSecondaryText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  settingsCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[5],
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[4],
  },
  settingsIconText: {
    fontSize: 28,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    ...theme.typography.styles.bodySemibold,
    marginBottom: theme.spacing[1],
  },
  settingsSubtitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  chevron: {
    fontSize: 24,
    color: theme.colors.gray[400],
    fontWeight: '300',
    marginLeft: theme.spacing[2],
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing[5] + 56 + theme.spacing[4], // Align with text
  },
  bottomPadding: {
    height: 120, // Extra padding for bottom nav
  },
});
