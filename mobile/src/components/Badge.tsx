import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

type BadgeVariant = 'critical' | 'warning' | 'info' | 'success';

interface BadgeProps {
  count: number;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ count, variant = 'info', style }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'critical':
        return theme.colors.badge.critical;
      case 'warning':
        return theme.colors.badge.warning;
      case 'info':
        return theme.colors.badge.info;
      case 'success':
        return theme.colors.good.DEFAULT;
      default:
        return theme.colors.badge.info;
    }
  };

  if (count === 0) return null;

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }, style]}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...theme.typography.styles.tiny,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
