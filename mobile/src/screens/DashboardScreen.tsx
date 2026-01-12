import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { InventoryCard, InventoryItem } from '../components/InventoryCard';
import { CategoryHeader } from '../components/CategoryHeader';
import { Badge } from '../components/Badge';
import { inventoryApi } from '../services/inventory.api';

type GroupBy = 'category' | 'location';
type SortMode = 'priority' | 'custom';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [groupBy, setGroupBy] = useState<GroupBy>('category');
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customCategoryOrder, setCustomCategoryOrder] = useState<string[]>([]);

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setError(null);
      console.log('Fetching inventory...');
      const data = await inventoryApi.getInventoryItems();
      console.log('Inventory data received:', data);
      // Map backend data to match InventoryItem interface
      const mappedData: InventoryItem[] = data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        location: item.location,
        quantity: item.quantity,
        unit: item.unit,
        daysRemaining: item.daysRemaining || 0,
        status: item.status,
        burnRate: item.burnRate,
        lastUpdated: item.lastUpdated,
        userId: item.userId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      console.log('Mapped data:', mappedData.length, 'items');
      setInventory(mappedData);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError(err.message || 'Failed to load inventory');
      // Don't show alert immediately, let user try pull-to-refresh
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInventory();
  }, []);

  // Group items by category or location
  const groupedItems: Record<string, InventoryItem[]> = inventory.reduce((groups, item) => {
    const key = groupBy === 'category' ? item.category : item.location;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, InventoryItem[]>);

  // Initialize custom order if not set
  const categoryKeys = Object.keys(groupedItems);
  useEffect(() => {
    if (customCategoryOrder.length === 0 && categoryKeys.length > 0) {
      setCustomCategoryOrder(categoryKeys.sort((a, b) => a.localeCompare(b)));
    }
  }, [categoryKeys.length]);

  // Sort groups based on mode
  let sortedGroups: [string, InventoryItem[]][];
  if (sortMode === 'priority') {
    sortedGroups = Object.entries(groupedItems).sort(([, itemsA], [, itemsB]) => {
      const urgencyA = itemsA.filter(i => i.status === 'critical' || i.status === 'low').length;
      const urgencyB = itemsB.filter(i => i.status === 'critical' || i.status === 'low').length;
      return urgencyB - urgencyA;
    });
  } else {
    // Custom sort: use custom order if available
    const orderMap = customCategoryOrder.reduce((map, key, index) => {
      map[key] = index;
      return map;
    }, {} as Record<string, number>);

    sortedGroups = Object.entries(groupedItems).sort(([a], [b]) => {
      const indexA = orderMap[a] !== undefined ? orderMap[a] : 999;
      const indexB = orderMap[b] !== undefined ? orderMap[b] : 999;
      if (indexA !== indexB) return indexA - indexB;
      return a.localeCompare(b);
    });
  }

  // Function to move category up/down in custom order
  const moveCategoryUp = (category: string) => {
    const index = customCategoryOrder.indexOf(category);
    if (index > 0) {
      const newOrder = [...customCategoryOrder];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setCustomCategoryOrder(newOrder);
    }
  };

  const moveCategoryDown = (category: string) => {
    const index = customCategoryOrder.indexOf(category);
    if (index < customCategoryOrder.length - 1 && index !== -1) {
      const newOrder = [...customCategoryOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setCustomCategoryOrder(newOrder);
    }
  };

  const lowItemsCount = inventory.filter(
    item => item.status === 'critical' || item.status === 'low'
  ).length;

  const handleItemPress = (item: InventoryItem) => {
    console.log('Item pressed:', item.name);
    navigation.navigate('ItemDetail', { item });
  };

  const handleShoppingListPress = () => {
    console.log('Navigate to shopping list');
    navigation.navigate('ShoppingList');
  };

  const handleSearchPress = () => {
    console.log('Navigate to search');
    navigation.navigate('Search');
  };

  const handleAIPress = () => {
    console.log('Open AI summary');
    Alert.alert('AI Summary', 'AI summary feature coming in Phase 3!');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>WeAreOut</Text>
              <Text style={styles.subtitle}>Your inventory concierge</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchPress}
                activeOpacity={0.7}
              >
                <Text style={styles.searchIcon}>🔍</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.aiButton}
                onPress={handleAIPress}
                activeOpacity={0.7}
              >
                <Text style={styles.aiIcon}>✨</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionBarContent}
          >
            <TouchableOpacity
              style={styles.shoppingListButton}
              onPress={handleShoppingListPress}
              activeOpacity={0.7}
            >
              <Text style={styles.shoppingCartIcon}>🛒</Text>
              <Text style={styles.shoppingListText}>Shopping List</Text>
              {lowItemsCount > 0 && (
                <Badge count={lowItemsCount} variant="critical" />
              )}
            </TouchableOpacity>

            <View style={styles.toggleGroup}>
              <TouchableOpacity
                style={[styles.toggleButton, groupBy === 'category' && styles.toggleButtonActive]}
                onPress={() => setGroupBy('category')}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleIcon}>📋</Text>
                <Text style={[styles.toggleText, groupBy === 'category' && styles.toggleTextActive]}>
                  Category
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, groupBy === 'location' && styles.toggleButtonActive]}
                onPress={() => setGroupBy('location')}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleIcon}>📍</Text>
                <Text style={[styles.toggleText, groupBy === 'location' && styles.toggleTextActive]}>
                  Location
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Sort Mode */}
        <View style={styles.sortBar}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[styles.toggleButton, sortMode === 'priority' && styles.toggleButtonActive]}
              onPress={() => setSortMode('priority')}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleIcon}>↕️</Text>
              <Text style={[styles.toggleText, sortMode === 'priority' && styles.toggleTextActive]}>
                Priority
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, sortMode === 'custom' && styles.toggleButtonActive]}
              onPress={() => setSortMode('custom')}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleIcon}>☰</Text>
              <Text style={[styles.toggleText, sortMode === 'custom' && styles.toggleTextActive]}>
                Custom
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inventory List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[500]} />
              <Text style={styles.loadingText}>Loading inventory...</Text>
            </View>
          ) : inventory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No inventory items yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the + button below to add your first item
              </Text>
            </View>
          ) : (
            <>
              {sortedGroups.map(([groupName, items], index) => (
                <View key={groupName}>
                  <CategoryHeader
                    categoryName={groupName}
                    items={items}
                    showReorderControls={sortMode === 'custom'}
                    onMoveUp={() => moveCategoryUp(groupName)}
                    onMoveDown={() => moveCategoryDown(groupName)}
                    isFirst={index === 0}
                    isLast={index === sortedGroups.length - 1}
                  />
                  {items.map(item => (
                    <InventoryCard key={item.id} item={item} onPress={handleItemPress} />
                  ))}
                </View>
              ))}
            </>
          )}
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[6],
  },
  title: {
    ...theme.typography.styles.h1,
    marginBottom: theme.spacing[1],
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 20,
  },
  aiButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIcon: {
    fontSize: 20,
  },
  actionBar: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  actionBarContent: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
    gap: theme.spacing[3],
  },
  shoppingListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.xl,
  },
  shoppingCartIcon: {
    fontSize: 16,
  },
  shoppingListText: {
    ...theme.typography.styles.label,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: theme.colors.muted,
    borderRadius: theme.borderRadius.xl,
    padding: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.lg,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.background,
    ...theme.shadows.sm,
  },
  toggleIcon: {
    fontSize: 14,
  },
  toggleText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  toggleTextActive: {
    color: theme.colors.text.primary,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sortLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing[10],
  },
  loadingText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[4],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing[10],
    paddingHorizontal: theme.spacing[6],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },
  emptyTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  emptySubtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100, // Padding for bottom nav
  },
});
