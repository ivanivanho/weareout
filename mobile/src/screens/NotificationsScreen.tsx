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

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [expiryReminders, setExpiryReminders] = useState(true);
  const [shoppingListUpdates, setShoppingListUpdates] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(false);

  const handleTogglePushNotifications = (value: boolean) => {
    if (!value) {
      Alert.alert(
        'Disable Push Notifications',
        'You will no longer receive alerts about low stock items. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => setPushNotificationsEnabled(value),
          },
        ]
      );
    } else {
      setPushNotificationsEnabled(value);
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Push Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PUSH NOTIFICATIONS</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Enable Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications on your device
                </Text>
              </View>
              <Switch
                value={pushNotificationsEnabled}
                onValueChange={handleTogglePushNotifications}
                trackColor={{
                  false: theme.colors.gray[300],
                  true: theme.colors.primary[500],
                }}
                thumbColor={theme.colors.background}
              />
            </View>

            {pushNotificationsEnabled && (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Low Stock Alerts</Text>
                    <Text style={styles.settingDescription}>
                      When items are running low
                    </Text>
                  </View>
                  <Switch
                    value={lowStockAlerts}
                    onValueChange={setLowStockAlerts}
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary[500],
                    }}
                    thumbColor={theme.colors.background}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Critical Alerts</Text>
                    <Text style={styles.settingDescription}>
                      When items are critically low or out
                    </Text>
                  </View>
                  <Switch
                    value={criticalAlerts}
                    onValueChange={setCriticalAlerts}
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary[500],
                    }}
                    thumbColor={theme.colors.background}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Expiry Reminders</Text>
                    <Text style={styles.settingDescription}>
                      When items are about to expire
                    </Text>
                  </View>
                  <Switch
                    value={expiryReminders}
                    onValueChange={setExpiryReminders}
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary[500],
                    }}
                    thumbColor={theme.colors.background}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Shopping List Updates</Text>
                    <Text style={styles.settingDescription}>
                      When shopping list changes
                    </Text>
                  </View>
                  <Switch
                    value={shoppingListUpdates}
                    onValueChange={setShoppingListUpdates}
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary[500],
                    }}
                    thumbColor={theme.colors.background}
                  />
                </View>
              </>
            )}
          </View>

          {/* Email Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EMAIL NOTIFICATIONS</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Enable Email Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive updates via email
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{
                  false: theme.colors.gray[300],
                  true: theme.colors.primary[500],
                }}
                thumbColor={theme.colors.background}
              />
            </View>

            {emailNotifications && (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Weekly Reports</Text>
                    <Text style={styles.settingDescription}>
                      Summary of your inventory every week
                    </Text>
                  </View>
                  <Switch
                    value={weeklyReports}
                    onValueChange={setWeeklyReports}
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary[500],
                    }}
                    thumbColor={theme.colors.background}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Monthly Reports</Text>
                    <Text style={styles.settingDescription}>
                      Detailed insights every month
                    </Text>
                  </View>
                  <Switch
                    value={monthlyReports}
                    onValueChange={setMonthlyReports}
                    trackColor={{
                      false: theme.colors.gray[300],
                      true: theme.colors.primary[500],
                    }}
                    thumbColor={theme.colors.background}
                  />
                </View>
              </>
            )}
          </View>

          {/* Quiet Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUIET HOURS</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Alert.alert('Quiet Hours', 'This feature will be available soon!');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>Set Quiet Hours</Text>
                <Text style={styles.menuItemSubtext}>
                  No notifications during specified times
                </Text>
              </View>
              <Text style={styles.menuItemIcon}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Notification settings help you stay on top of your inventory without being overwhelmed. Customize what alerts you receive.
            </Text>
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
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  menuItemSubtext: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  menuItemIcon: {
    fontSize: 24,
    color: theme.colors.text.secondary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: theme.spacing[6],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.xl,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: theme.spacing[3],
  },
  infoText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
});
