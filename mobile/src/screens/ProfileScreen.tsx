import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { user, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setSaving(true);
    try {
      // TODO: Implement API call to update user profile
      console.log('📝 [Profile] Updating profile:', { name, email });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('❌ [Profile] Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('👋 [Profile] Logging out...');
            await logout();
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            activeOpacity={0.7}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
            ) : (
              <Text style={styles.editButtonText}>
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoButton} activeOpacity={0.7}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.colors.text.secondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              ) : (
                <Text style={styles.value}>{name || 'Not set'}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{email}</Text>
              <Text style={styles.helpText}>Email cannot be changed</Text>
            </View>
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log('Navigate to change password');
                Alert.alert('Change Password', 'This feature will be available soon!');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Change Password</Text>
              <Text style={styles.menuItemIcon}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log('Navigate to privacy & security');
                navigation.navigate('PrivacySecurity');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Privacy & Security</Text>
              <Text style={styles.menuItemIcon}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log('Navigate to notifications');
                navigation.navigate('Notifications');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Notification Settings</Text>
              <Text style={styles.menuItemIcon}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'This will permanently delete your account and all data. This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        console.log('Delete account');
                        Alert.alert('Delete Account', 'This feature will be available soon!');
                      },
                    },
                  ]
                );
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>WeAreOut v1.0.0</Text>
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
  editButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    ...theme.typography.styles.label,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing[8],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
  },
  avatarText: {
    fontSize: 42,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.background,
  },
  changePhotoButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  changePhotoText: {
    ...theme.typography.styles.label,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semibold,
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
    marginBottom: theme.spacing[4],
  },
  inputGroup: {
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[5],
  },
  label: {
    ...theme.typography.styles.label,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  input: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  value: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing[2],
  },
  helpText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[2],
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
  logoutButton: {
    marginHorizontal: theme.spacing[6],
    marginTop: theme.spacing[4],
    paddingVertical: theme.spacing[5],
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  deleteButton: {
    marginHorizontal: theme.spacing[6],
    marginTop: theme.spacing[3],
    paddingVertical: theme.spacing[5],
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.critical.DEFAULT,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.critical.DEFAULT,
    fontSize: 16,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing[6],
  },
  versionText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  bottomPadding: {
    height: 40,
  },
});
