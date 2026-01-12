import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { InventoryItem } from '../components/InventoryCard';
import { inventoryApi, shoppingListApi } from '../services/inventory.api';
import { PurchaseHistory } from '../types/inventory';

type ItemDetailRouteProp = RouteProp<{ ItemDetail: { item: InventoryItem } }, 'ItemDetail'>;

export const ItemDetailScreen: React.FC = () => {
  const route = useRoute<ItemDetailRouteProp>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { item } = route.params;
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch purchase history on mount
  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        console.log('📦 [ItemDetail] Fetching purchase history for item:', item.id);
        const history = await inventoryApi.getPurchaseHistory(item.id);
        console.log('📦 [ItemDetail] Purchase history received:', history.length, 'records');
        setPurchaseHistory(history);
      } catch (error) {
        console.error('❌ [ItemDetail] Error fetching purchase history:', error);
        // Keep empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, [item.id]);

  const onBack = () => navigation.goBack();

  // Handler for "Mark as Out" button
  const handleMarkAsOut = async () => {
    try {
      Alert.alert(
        'Mark as Out',
        `Mark "${item.name}" as out of stock?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark as Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await inventoryApi.updateInventoryItem(item.id, { quantity: 0 });
                Alert.alert('Success', `${item.name} marked as out of stock`);
                navigation.goBack();
              } catch (error) {
                console.error('❌ Error marking item as out:', error);
                Alert.alert('Error', 'Failed to mark item as out. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error in handleMarkAsOut:', error);
    }
  };

  // Handler for "Add to List" button
  const handleAddToList = async () => {
    try {
      await shoppingListApi.createShoppingListItem({
        itemName: item.name,
        category: item.category,
        quantity: 1,
        unit: item.unit,
        priority: item.status === 'critical' ? 'urgent' : item.status === 'low' ? 'high' : 'medium',
      });
      Alert.alert('Added to List', `${item.name} has been added to your shopping list`);
    } catch (error: any) {
      console.error('❌ Error adding to shopping list:', error);
      Alert.alert('Error', error.message || 'Failed to add item to shopping list. Please try again.');
    }
  };

  const getStatusText = () => {
    switch (item.status) {
      case 'critical':
        return 'Critical';
      case 'low':
        return 'Running Low';
      case 'good':
        return 'Well Stocked';
      default:
        return 'Unknown';
    }
  };

  const getStatusBackgroundColor = () => {
    switch (item.status) {
      case 'critical':
        return theme.colors.critical.background;
      case 'low':
        return theme.colors.low.background;
      case 'good':
        return theme.colors.good.background;
      default:
        return theme.colors.gray[100];
    }
  };

  const getStatusTextColor = () => {
    switch (item.status) {
      case 'critical':
        return theme.colors.critical.dark;
      case 'low':
        return theme.colors.low.dark;
      case 'good':
        return theme.colors.good.dark;
      default:
        return theme.colors.text.secondary;
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate days ago from purchase date
  const getDaysAgo = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const burnRate = item.burnRate || 0;
  const estimatedEmptyDate = item.daysRemaining ?
    new Date(Date.now() + item.daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
    'Unknown';
  const confidence = purchaseHistory.length >= 3 ? 'High accuracy' :
                     purchaseHistory.length >= 2 ? 'Medium accuracy' :
                     'Low accuracy';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item Details</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Item Name */}
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>📍 {item.location}</Text>
              <Text style={styles.separator}>·</Text>
              <Text style={styles.metaText}>{item.category}</Text>
            </View>
          </View>

          {/* Current Status Card */}
          <View style={[styles.statusCard, { backgroundColor: getStatusBackgroundColor() }]}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Current Status</Text>
              <View style={styles.statusBadge}>
                <Text style={[styles.statusBadgeText, { color: getStatusTextColor() }]}>
                  {getStatusText()}
                </Text>
              </View>
            </View>

            <View style={styles.statusMetrics}>
              <View style={styles.metricColumn}>
                <Text style={styles.metricLabel}>Stock Level</Text>
                <View style={styles.metricValueRow}>
                  <Text style={styles.metricValue}>{item.quantity}</Text>
                  <Text style={styles.metricUnit}> {item.unit}</Text>
                </View>
              </View>

              <View style={styles.metricColumn}>
                <Text style={styles.metricLabel}>Days Remaining</Text>
                <View style={styles.metricValueRow}>
                  <Text style={[styles.metricValue, { color: getStatusTextColor() }]}>
                    {item.daysRemaining}
                  </Text>
                  <Text style={styles.metricUnit}> days</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Consumption Intelligence */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consumption Intelligence</Text>

            <View style={styles.infoCard}>
              <View style={styles.iconCircle}>
                <Text style={styles.infoIcon}>📉</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Average Burn Rate</Text>
                <Text style={styles.infoSubtitle}>Based on last 3 purchases</Text>
              </View>
              <Text style={styles.infoValue}>{burnRate} g/day</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.iconCircle}>
                <Text style={styles.infoIcon}>🕐</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Estimated Empty Date</Text>
                <Text style={styles.infoSubtitle}>When you'll likely run out</Text>
              </View>
              <Text style={styles.infoValue}>{estimatedEmptyDate}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.iconCircle}>
                <Text style={styles.infoIcon}>📦</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Prediction Confidence</Text>
                <Text style={styles.infoSubtitle}>{confidence}</Text>
              </View>
              <View style={styles.confidenceBars}>
                <View style={styles.confidenceBar} />
                <View style={styles.confidenceBar} />
                <View style={styles.confidenceBar} />
              </View>
            </View>
          </View>

          {/* Purchase History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Purchase History</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                <Text style={styles.loadingText}>Loading purchase history...</Text>
              </View>
            ) : purchaseHistory.length === 0 ? (
              <View style={styles.emptyHistoryContainer}>
                <Text style={styles.emptyHistoryIcon}>📦</Text>
                <Text style={styles.emptyHistoryText}>No purchase history yet</Text>
                <Text style={styles.emptyHistorySubtext}>
                  Purchase history will appear here as you track this item
                </Text>
              </View>
            ) : (
              purchaseHistory.map((purchase, index) => {
                const daysAgo = getDaysAgo(purchase.purchaseDate);
                return (
                  <View key={purchase.id} style={styles.historyCard}>
                    <View style={styles.historyIcon}>
                      <Text style={styles.historyIconText}>📅</Text>
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyDate}>{formatDate(purchase.purchaseDate)}</Text>
                      <Text style={styles.historySubtitle}>
                        {index === 0 ? 'Most recent purchase' : `${daysAgo} days ago`}
                      </Text>
                    </View>
                    <Text style={styles.historyQuantity}>
                      {purchase.quantity} {purchase.unit}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.7}
              onPress={handleMarkAsOut}
            >
              <Text style={styles.secondaryButtonText}>Mark as Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AddEditInventory', { item, mode: 'edit' })}
            >
              <Text style={styles.secondaryButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.7}
              onPress={handleAddToList}
            >
              <Text style={styles.primaryButtonText}>Add to List</Text>
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
  itemHeader: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[6],
  },
  itemName: {
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  metaText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
  },
  separator: {
    color: theme.colors.text.secondary,
  },
  statusCard: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
    padding: theme.spacing[5],
    borderRadius: theme.borderRadius['2xl'],
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[5],
  },
  statusTitle: {
    ...theme.typography.styles.h4,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  statusBadgeText: {
    ...theme.typography.styles.label,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statusMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricColumn: {
    flex: 1,
  },
  metricLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  metricUnit: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    ...theme.typography.styles.h3,
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
    backgroundColor: theme.colors.gray[100],
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[3],
    borderRadius: theme.borderRadius.xl,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...theme.typography.styles.bodySemibold,
    marginBottom: theme.spacing[1],
  },
  infoSubtitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    ...theme.typography.styles.h4,
    fontWeight: theme.typography.fontWeight.bold,
  },
  confidenceBars: {
    flexDirection: 'row',
    gap: 4,
  },
  confidenceBar: {
    width: 8,
    height: 28,
    backgroundColor: theme.colors.text.primary,
    borderRadius: 4,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[5],
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[3],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
  },
  historyIconText: {
    fontSize: 24,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    ...theme.typography.styles.bodySemibold,
    marginBottom: theme.spacing[1],
  },
  historySubtitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  historyQuantity: {
    ...theme.typography.styles.h4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    marginTop: theme.spacing[4],
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: theme.spacing[4],
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...theme.typography.styles.label,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: theme.spacing[4],
    backgroundColor: theme.colors.text.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...theme.typography.styles.label,
    color: theme.colors.background,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  bottomPadding: {
    height: 40,
  },
  loadingContainer: {
    paddingVertical: theme.spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[2],
  },
  emptyHistoryContainer: {
    paddingVertical: theme.spacing[8],
    paddingHorizontal: theme.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistoryIcon: {
    fontSize: 48,
    marginBottom: theme.spacing[3],
  },
  emptyHistoryText: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  emptyHistorySubtext: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
