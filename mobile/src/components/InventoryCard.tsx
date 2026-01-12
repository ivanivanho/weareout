import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';

export type ItemStatus = 'good' | 'low' | 'critical';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  daysRemaining: number;
  status: ItemStatus;
  burnRate?: number;
  lastUpdated: string;
}

interface InventoryCardProps {
  item: InventoryItem;
  onPress: (item: InventoryItem) => void;
}

const screenWidth = Dimensions.get('window').width;
const CARD_PADDING = theme.spacing[6];

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, onPress }) => {
  const getStatusColor = () => {
    switch (item.status) {
      case 'critical':
        return theme.colors.critical.DEFAULT;
      case 'low':
        return theme.colors.low.DEFAULT;
      case 'good':
        return theme.colors.good.DEFAULT;
      default:
        return theme.colors.gray[400];
    }
  };

  const getProgressWidth = () => {
    // Calculate progress based on days remaining (max 10 days = 100%)
    const maxDays = 10;
    const percentage = Math.min((item.daysRemaining / maxDays) * 100, 100);
    return `${percentage}%`;
  };

  const statusColor = getStatusColor();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Item name and quantity */}
        <View style={styles.topRow}>
          <View style={styles.leftContent}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.quantity}>
              {item.quantity} {item.unit}
            </Text>
          </View>

          <View style={styles.rightContent}>
            <Text style={[styles.daysNumber, { color: statusColor }]}>
              {item.daysRemaining}
            </Text>
            <Text style={styles.daysLabel}>days</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: getProgressWidth(),
                  backgroundColor: statusColor,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Chevron indicator */}
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    marginHorizontal: CARD_PADDING,
    marginBottom: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  cardContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
    marginLeft: theme.spacing[4],
  },
  itemName: {
    ...theme.typography.styles.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  quantity: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  daysNumber: {
    ...theme.typography.styles.h3,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: 28,
  },
  daysLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  chevron: {
    marginLeft: theme.spacing[2],
  },
  chevronText: {
    fontSize: 24,
    color: theme.colors.gray[400],
    fontWeight: '300',
  },
});
