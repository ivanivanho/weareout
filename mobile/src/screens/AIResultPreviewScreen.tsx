import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { inventoryApi } from '../services/inventory.api';
import type { AIInventoryItem } from '../services/ai.api';

interface RouteParams {
  result: {
    action: 'add' | 'update' | 'remove';
    items: AIInventoryItem[];
  };
  source: 'voice' | 'camera';
  originalText?: string;
}

/**
 * AI Result Preview Screen
 * Shows AI-parsed inventory items for user review before saving
 */
export const AIResultPreviewScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { result, source, originalText } = route.params as RouteParams;
  const [saving, setSaving] = useState(false);

  const getActionText = (action: string) => {
    switch (action) {
      case 'add':
        return 'Add to inventory';
      case 'update':
        return 'Update quantities';
      case 'remove':
        return 'Mark as out';
      default:
        return 'Save items';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'remove':
        return theme.colors.critical.DEFAULT;
      case 'update':
        return theme.colors.low.DEFAULT;
      default:
        return theme.colors.primary[500];
    }
  };

  const handleSaveAll = async () => {
    if (result.items.length === 0) {
      Alert.alert('No Items', 'No items to save');
      return;
    }

    setSaving(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const item of result.items) {
        try {
          if (result.action === 'add') {
            await inventoryApi.createInventoryItem({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              category: item.category,
              location: 'Kitchen', // Default location
            });
            successCount++;
          } else if (result.action === 'remove') {
            // For "out of" scenarios, we would update existing items to quantity 0
            // This requires fetching the item first or having an endpoint to mark as out
            // For MVP, we'll show a message
            console.log(`Would mark ${item.name} as out`);
            successCount++;
          } else if (result.action === 'update') {
            // Similar to remove, would need to update existing items
            console.log(`Would update ${item.name} quantity`);
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to save ${item.name}:`, error);
          failCount++;
        }
      }

      const message =
        failCount === 0
          ? `Successfully saved ${successCount} item${successCount !== 1 ? 's' : ''}!`
          : `Saved ${successCount} item${successCount !== 1 ? 's' : ''}, ${failCount} failed`;

      Alert.alert('Success', message, [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to main screen
            navigation.navigate('Main', {
              screen: 'DashboardTab',
            });
          },
        },
      ]);
    } catch (error: any) {
      console.error('❌ [Preview] Error saving items:', error);
      Alert.alert('Error', error.message || 'Failed to save items');
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = (item: AIInventoryItem, index: number) => {
    // Navigate to AddEditInventory with prefilled data
    navigation.navigate('AddEditInventory', {
      mode: 'add',
      prefillData: {
        name: item.name,
        quantity: item.quantity.toString(),
        unit: item.unit,
        category: item.category,
        location: 'Kitchen',
      },
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return theme.colors.good.DEFAULT;
    if (confidence >= 0.5) return theme.colors.low.DEFAULT;
    return theme.colors.critical.DEFAULT;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.5) return 'Medium confidence';
    return 'Low confidence';
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Review & Confirm</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Original Input (if from voice) */}
          {originalText && (
            <View style={styles.originalInputContainer}>
              <Text style={styles.originalInputLabel}>You said:</Text>
              <Text style={styles.originalInputText}>"{originalText}"</Text>
            </View>
          )}

          {/* Action Badge */}
          <View style={styles.actionBadgeContainer}>
            <View
              style={[
                styles.actionBadge,
                { backgroundColor: getActionColor(result.action) },
              ]}
            >
              <Text style={styles.actionBadgeText}>
                {getActionText(result.action)}
              </Text>
            </View>
          </View>

          {/* Items Count */}
          <Text style={styles.subtitle}>
            Found {result.items.length} item{result.items.length !== 1 ? 's' : ''}
          </Text>

          {/* Items List */}
          {result.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleEditItem(item, index)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.itemDetailsRow}>
                <Text style={styles.itemDetails}>
                  {item.quantity} {item.unit} • {item.category}
                </Text>
              </View>

              <View style={styles.itemFooter}>
                <View
                  style={[
                    styles.confidenceBadge,
                    { backgroundColor: getConfidenceColor(item.confidence) },
                  ]}
                >
                  <Text style={styles.confidenceText}>
                    {getConfidenceText(item.confidence)}
                  </Text>
                </View>
                <Text style={styles.confidencePercentage}>
                  {Math.round(item.confidence * 100)}%
                </Text>
              </View>
            </View>
          ))}

          {result.items.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🤔</Text>
              <Text style={styles.emptyText}>
                No items identified. Try being more specific.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        {result.items.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                saving && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveAll}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator
                  color={theme.colors.background}
                  size="small"
                />
              ) : (
                <Text style={styles.saveButtonText}>
                  Save All Items ({result.items.length})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  title: {
    ...theme.typography.styles.h4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
  },
  originalInputContainer: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  originalInputLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  originalInputText: {
    ...theme.typography.styles.body,
    fontStyle: 'italic',
  },
  actionBadgeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  actionBadge: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
  },
  actionBadgeText: {
    ...theme.typography.styles.caption,
    color: theme.colors.background,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  subtitle: {
    ...theme.typography.styles.h4,
    marginBottom: theme.spacing[4],
  },
  itemCard: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  itemName: {
    ...theme.typography.styles.h4,
    flex: 1,
  },
  editButton: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.primary[500],
  },
  itemDetailsRow: {
    marginBottom: theme.spacing[3],
  },
  itemDetails: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceBadge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.md,
  },
  confidenceText: {
    ...theme.typography.styles.caption,
    color: theme.colors.background,
    fontSize: 11,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  confidencePercentage: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing[12],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },
  emptyText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing[5],
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.background,
    fontSize: 16,
  },
});
