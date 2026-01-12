import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { InventoryItem } from './InventoryCard';

interface CategoryHeaderProps {
  categoryName: string;
  items: InventoryItem[];
  showReorderControls?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryName,
  items,
  showReorderControls = false,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}) => {
  // Count items by status
  const criticalCount = items.filter(item => item.status === 'critical').length;
  const lowCount = items.filter(item => item.status === 'low').length;
  const totalCount = items.length;

  const getStatusText = () => {
    if (criticalCount > 0) {
      return `${criticalCount} critical`;
    }
    if (lowCount > 0) {
      return `${lowCount} low`;
    }
    return '';
  };

  const getStatusColor = () => {
    if (criticalCount > 0) {
      return theme.colors.critical.DEFAULT;
    }
    if (lowCount > 0) {
      return theme.colors.low.DEFAULT;
    }
    return theme.colors.text.secondary;
  };

  const statusText = getStatusText();

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.categoryName}>{categoryName}</Text>
        {statusText && (
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {statusText}
          </Text>
        )}
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.itemCount}>{totalCount} item{totalCount !== 1 ? 's' : ''}</Text>
        {showReorderControls && (
          <View style={styles.reorderControls}>
            <TouchableOpacity
              onPress={onMoveUp}
              disabled={isFirst}
              style={[styles.reorderButton, isFirst && styles.reorderButtonDisabled]}
              activeOpacity={0.7}
            >
              <Text style={[styles.reorderIcon, isFirst && styles.reorderIconDisabled]}>▲</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onMoveDown}
              disabled={isLast}
              style={[styles.reorderButton, isLast && styles.reorderButtonDisabled]}
              activeOpacity={0.7}
            >
              <Text style={[styles.reorderIcon, isLast && styles.reorderIconDisabled]}>▼</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.gray[50],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  categoryName: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.text.primary,
  },
  statusText: {
    ...theme.typography.styles.caption,
    fontWeight: theme.typography.fontWeight.medium,
  },
  itemCount: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing[3],
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderControls: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  reorderButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  reorderIcon: {
    fontSize: 12,
    color: theme.colors.text.primary,
  },
  reorderIconDisabled: {
    color: theme.colors.text.secondary,
  },
});
