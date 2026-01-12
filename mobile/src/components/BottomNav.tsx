import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { theme } from '../theme';

export type NavScreen = 'dashboard' | 'setup';

interface BottomNavProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  onInventoryUpdate: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  onInventoryUpdate,
}) => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.navBar}>
        {/* Dashboard Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onNavigate('dashboard')}
          activeOpacity={0.7}
        >
          <View style={styles.tabIcon}>
            <View style={styles.gridIcon}>
              <View style={[styles.gridDot, currentScreen === 'dashboard' && styles.gridDotActive]} />
              <View style={[styles.gridDot, currentScreen === 'dashboard' && styles.gridDotActive]} />
              <View style={[styles.gridDot, currentScreen === 'dashboard' && styles.gridDotActive]} />
              <View style={[styles.gridDot, currentScreen === 'dashboard' && styles.gridDotActive]} />
            </View>
          </View>
          <Text style={[styles.tabLabel, currentScreen === 'dashboard' && styles.tabLabelActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        {/* Center Update Button */}
        <View style={styles.centerButtonContainer}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={onInventoryUpdate}
            activeOpacity={0.8}
          >
            <View style={styles.plusIcon}>
              <View style={styles.plusHorizontal} />
              <View style={styles.plusVertical} />
            </View>
          </TouchableOpacity>
          <Text style={styles.updateLabel}>Update</Text>
        </View>

        {/* Setup Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onNavigate('setup')}
          activeOpacity={0.7}
        >
          <View style={styles.tabIcon}>
            <View style={styles.settingsIcon}>
              <View style={[styles.settingsGear, currentScreen === 'setup' && styles.settingsGearActive]} />
            </View>
          </View>
          <Text style={[styles.tabLabel, currentScreen === 'setup' && styles.tabLabelActive]}>
            Setup
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[8],
    paddingBottom: theme.spacing[2],
    height: 80,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: theme.spacing[2],
  },
  tabIcon: {
    marginBottom: theme.spacing[1],
  },
  tabLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  tabLabelActive: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  gridIcon: {
    width: 24,
    height: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridDot: {
    width: 8,
    height: 8,
    backgroundColor: theme.colors.gray[400],
    borderRadius: 2,
  },
  gridDotActive: {
    backgroundColor: theme.colors.text.primary,
  },
  settingsIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsGear: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.gray[400],
  },
  settingsGearActive: {
    borderColor: theme.colors.text.primary,
  },
  centerButtonContainer: {
    alignItems: 'center',
    marginHorizontal: theme.spacing[4],
    marginBottom: -10, // Raise the button slightly
  },
  updateButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  updateLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[2],
  },
  plusIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusHorizontal: {
    position: 'absolute',
    width: 20,
    height: 3,
    backgroundColor: theme.colors.background,
    borderRadius: 2,
  },
  plusVertical: {
    position: 'absolute',
    width: 3,
    height: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 2,
  },
});
