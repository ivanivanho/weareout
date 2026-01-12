import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { inventoryApi } from '../services/inventory.api';
import { InventoryItem } from '../types/inventory';

export const BulkEditScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedItems, setEditedItems] = useState<Map<string, Partial<InventoryItem>>>(new Map());

  // Fetch all inventory items
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getInventoryItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert('Error', 'Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  // Update item in local state
  const updateItem = (itemId: string, field: keyof InventoryItem, value: any) => {
    const currentEdits = editedItems.get(itemId) || {};
    const newEdits = { ...currentEdits, [field]: value };
    const newEditedItems = new Map(editedItems);
    newEditedItems.set(itemId, newEdits);
    setEditedItems(newEditedItems);
  };

  // Get the current value (edited or original)
  const getValue = (item: InventoryItem, field: keyof InventoryItem) => {
    const edits = editedItems.get(item.id);
    if (edits && field in edits) {
      return edits[field as keyof typeof edits];
    }
    return item[field];
  };

  // Save all changes
  const handleSaveAll = async () => {
    if (editedItems.size === 0) {
      Alert.alert('No Changes', 'No items have been modified');
      return;
    }

    Alert.alert(
      'Save Changes',
      `Save changes to ${editedItems.size} item(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            try {
              setSaving(true);
              let successCount = 0;
              let failCount = 0;

              for (const [itemId, changes] of editedItems.entries()) {
                try {
                  await inventoryApi.updateInventoryItem(itemId, changes);
                  successCount++;
                } catch (error) {
                  console.error(`Failed to update item ${itemId}:`, error);
                  failCount++;
                }
              }

              if (failCount === 0) {
                Alert.alert('Success', `${successCount} item(s) updated successfully`);
                setEditedItems(new Map());
                fetchItems(); // Refresh data
              } else {
                Alert.alert(
                  'Partial Success',
                  `${successCount} item(s) updated, ${failCount} failed`
                );
              }
            } catch (error) {
              console.error('Error saving changes:', error);
              Alert.alert('Error', 'Failed to save changes');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const renderItemEditor = (item: InventoryItem) => {
    const hasEdits = editedItems.has(item.id);
    const name = getValue(item, 'name') as string;
    const location = getValue(item, 'location') as string;
    const quantity = getValue(item, 'quantity') as number;
    const unit = getValue(item, 'unit') as string;

    return (
      <View key={item.id} style={[styles.itemCard, hasEdits && styles.itemCardEdited]}>
        {/* Item Name */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Item Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={(value) => updateItem(item.id, 'name', value)}
            placeholder="Item name"
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>

        {/* Location */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={(value) => updateItem(item.id, 'location', value)}
            placeholder="Location"
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>

        {/* Quantity & Unit */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Quantity</Text>
          <View style={styles.quantityRow}>
            <TextInput
              style={[styles.textInput, styles.quantityInput]}
              value={quantity?.toString() || ''}
              onChangeText={(value) => {
                const numValue = parseFloat(value) || 0;
                updateItem(item.id, 'quantity', numValue);
              }}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.colors.text.secondary}
            />
            <TextInput
              style={[styles.textInput, styles.unitInput]}
              value={unit}
              onChangeText={(value) => updateItem(item.id, 'unit', value)}
              placeholder="units"
              placeholderTextColor={theme.colors.text.secondary}
            />
          </View>
        </View>

        {/* Burn Rate Info (Read-only suggestion) */}
        {item.burnRate !== undefined && item.burnRate > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📉 Burn Rate:</Text>
            <Text style={styles.infoValue}>{item.burnRate.toFixed(2)} {unit}/day</Text>
          </View>
        )}

        {item.daysRemaining !== null && item.daysRemaining !== undefined && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⏱️ Days Remaining:</Text>
            <Text style={styles.infoValue}>{item.daysRemaining} days</Text>
          </View>
        )}

        {/* Status Indicator */}
        {hasEdits && (
          <View style={styles.editedBadge}>
            <Text style={styles.editedBadgeText}>Modified</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit All Items</Text>
          <View style={styles.backButton} />
        </View>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              editedItems.size === 0 && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveAll}
            disabled={saving || editedItems.size === 0}
            activeOpacity={0.7}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.background} />
            ) : (
              <Text style={styles.saveButtonText}>
                Save {editedItems.size > 0 ? `(${editedItems.size})` : 'All'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[500]} />
              <Text style={styles.loadingText}>Loading items...</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No items to edit</Text>
              <Text style={styles.emptySubtitle}>
                Add some items to your inventory first
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>Bulk Edit Mode</Text>
                <Text style={styles.instructionsText}>
                  • Edit names, locations, and quantities
                  {'\n'}• Modified items are highlighted
                  {'\n'}• Burn rates are automatically calculated
                  {'\n'}• Tap Save to apply all changes
                </Text>
              </View>

              {items.map(renderItemEditor)}
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
  saveButtonContainer: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  saveButton: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  saveButtonText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.background,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  instructionsCard: {
    marginHorizontal: theme.spacing[6],
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[4],
    padding: theme.spacing[5],
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  instructionsTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.primary[700],
    marginBottom: theme.spacing[2],
  },
  instructionsText: {
    ...theme.typography.styles.body,
    color: theme.colors.primary[600],
    lineHeight: 20,
  },
  itemCard: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[4],
    padding: theme.spacing[5],
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemCardEdited: {
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
    backgroundColor: theme.colors.primary[50],
  },
  fieldRow: {
    marginBottom: theme.spacing[4],
  },
  fieldLabel: {
    ...theme.typography.styles.label,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  textInput: {
    ...theme.typography.styles.body,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    color: theme.colors.text.primary,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  quantityInput: {
    flex: 2,
  },
  unitInput: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing[2],
  },
  infoLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  editedBadge: {
    position: 'absolute',
    top: theme.spacing[3],
    right: theme.spacing[3],
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.md,
  },
  editedBadgeText: {
    ...theme.typography.styles.caption,
    color: theme.colors.background,
    fontWeight: theme.typography.fontWeight.bold,
  },
  loadingContainer: {
    paddingVertical: theme.spacing[10],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[4],
  },
  emptyContainer: {
    paddingVertical: theme.spacing[10],
    paddingHorizontal: theme.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 40,
  },
});
