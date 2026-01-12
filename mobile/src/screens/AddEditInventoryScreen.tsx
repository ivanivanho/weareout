import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { inventoryApi } from '../services/inventory.api';
import { InventoryItem } from '../types/inventory';

type AddEditInventoryRouteProp = RouteProp<
  {
    AddEditInventory: {
      item?: InventoryItem;
      mode: 'add' | 'edit';
      prefillData?: {
        name?: string;
        category?: string;
        location?: string;
        quantity?: string;
        unit?: string;
      };
    };
  },
  'AddEditInventory'
>;

export const AddEditInventoryScreen: React.FC = () => {
  const route = useRoute<AddEditInventoryRouteProp>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { item, mode, prefillData } = route.params || { mode: 'add' };

  // Initialize with prefillData from AI if available, otherwise use item data
  const [name, setName] = useState(prefillData?.name || item?.name || '');
  const [category, setCategory] = useState(prefillData?.category || item?.category || '');
  const [location, setLocation] = useState(prefillData?.location || item?.location || '');
  const [quantity, setQuantity] = useState(prefillData?.quantity || item?.quantity?.toString() || '');
  const [unit, setUnit] = useState(prefillData?.unit || item?.unit || '');
  const [burnRate, setBurnRate] = useState(item?.burnRate?.toString() || '');
  const [saving, setSaving] = useState(false);

  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'Edit Item' : 'Add New Item';

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Please select a location');
      return;
    }
    if (!quantity.trim() || isNaN(Number(quantity))) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }
    if (!unit.trim()) {
      Alert.alert('Error', 'Please enter a unit');
      return;
    }

    setSaving(true);

    try {
      const data = {
        name: name.trim(),
        category: category.trim(),
        location: location.trim(),
        quantity: Number(quantity),
        unit: unit.trim(),
        burnRate: burnRate ? Number(burnRate) : undefined,
      };

      if (isEditMode && item) {
        console.log('📝 [AddEdit] Updating item:', item.id);
        await inventoryApi.updateInventoryItem(item.id, data);
        Alert.alert('Success', 'Item updated successfully!');
      } else {
        console.log('📝 [AddEdit] Creating new item');
        await inventoryApi.createInventoryItem(data);
        Alert.alert('Success', 'Item added successfully!');
      }

      navigation.goBack();
    } catch (error: any) {
      console.error('❌ [AddEdit] Error saving item:', error);
      Alert.alert('Error', error.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !item) return;

    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await inventoryApi.deleteInventoryItem(item.id);
              Alert.alert('Success', 'Item deleted successfully!');
              navigation.goBack();
            } catch (error: any) {
              console.error('❌ [AddEdit] Error deleting item:', error);
              Alert.alert('Error', error.message || 'Failed to delete item');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ITEM DETAILS</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Ground Coffee"
                placeholderTextColor={theme.colors.text.secondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Beverages"
                placeholderTextColor={theme.colors.text.secondary}
                value={category}
                onChangeText={setCategory}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Kitchen - Counter"
                placeholderTextColor={theme.colors.text.secondary}
                value={location}
                onChangeText={setLocation}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Quantity Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUANTITY</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex2]}>
                <Text style={styles.label}>Amount *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={theme.colors.text.secondary}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Unit *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="g, L, pcs"
                  placeholderTextColor={theme.colors.text.secondary}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>
          </View>

          {/* Optional Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OPTIONAL</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Burn Rate (per day)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 50"
                placeholderTextColor={theme.colors.text.secondary}
                value={burnRate}
                onChangeText={setBurnRate}
                keyboardType="decimal-pad"
              />
              <Text style={styles.helpText}>
                How much you consume per day (in {unit || 'units'})
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isEditMode ? 'Save Changes' : 'Add Item'}
                </Text>
              )}
            </TouchableOpacity>

            {isEditMode && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteButtonText}>Delete Item</Text>
              </TouchableOpacity>
            )}
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
    fontSize: 24,
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
    paddingHorizontal: theme.spacing[6],
    marginTop: theme.spacing[6],
  },
  sectionTitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: 0.5,
    marginBottom: theme.spacing[4],
  },
  inputGroup: {
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
  helpText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[2],
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing[6],
    marginTop: theme.spacing[8],
    gap: theme.spacing[3],
  },
  saveButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.background,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.critical.DEFAULT,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.critical.DEFAULT,
    fontSize: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
