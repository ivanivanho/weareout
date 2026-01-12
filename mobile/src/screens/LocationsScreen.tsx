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

interface Location {
  id: string;
  name: string;
  isDefault: boolean;
}

export const LocationsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  // Mock data - in real app this would come from API
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', name: 'Kitchen - Counter', isDefault: true },
    { id: '2', name: 'Kitchen - Pantry', isDefault: false },
    { id: '3', name: 'Kitchen - Fridge', isDefault: false },
    { id: '4', name: 'Bathroom', isDefault: false },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    setLoading(true);
    try {
      console.log('📍 [Locations] Adding new location:', newLocationName);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newLocation: Location = {
        id: Date.now().toString(),
        name: newLocationName.trim(),
        isDefault: false,
      };

      setLocations([...locations, newLocation]);
      setNewLocationName('');
      setIsAdding(false);
      Alert.alert('Success', 'Location added successfully!');
    } catch (error: any) {
      console.error('❌ [Locations] Error adding location:', error);
      Alert.alert('Error', error.message || 'Failed to add location');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    if (!location) return;

    if (location.isDefault) {
      Alert.alert('Error', 'Cannot delete the default location');
      return;
    }

    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${location.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('📍 [Locations] Deleting location:', locationId);

              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 500));

              setLocations(locations.filter(l => l.id !== locationId));
              Alert.alert('Success', 'Location deleted successfully!');
            } catch (error: any) {
              console.error('❌ [Locations] Error deleting location:', error);
              Alert.alert('Error', error.message || 'Failed to delete location');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    if (!location) return;

    Alert.alert(
      'Set Default Location',
      `Set "${location.name}" as the default location?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Default',
          onPress: async () => {
            try {
              console.log('📍 [Locations] Setting default location:', locationId);

              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 500));

              setLocations(locations.map(l => ({
                ...l,
                isDefault: l.id === locationId,
              })));
              Alert.alert('Success', 'Default location updated!');
            } catch (error: any) {
              console.error('❌ [Locations] Error setting default:', error);
              Alert.alert('Error', error.message || 'Failed to set default location');
            }
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
          <Text style={styles.headerTitle}>Locations</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAdding(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>
              Organize your inventory by creating custom locations for different areas of your home
            </Text>
          </View>

          {/* Add Location Form */}
          {isAdding && (
            <View style={styles.addForm}>
              <Text style={styles.sectionTitle}>ADD NEW LOCATION</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Living Room - Cabinet"
                placeholderTextColor={theme.colors.text.secondary}
                value={newLocationName}
                onChangeText={setNewLocationName}
                autoFocus
                autoCapitalize="words"
              />
              <View style={styles.addFormButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsAdding(false);
                    setNewLocationName('');
                  }}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                  onPress={handleAddLocation}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.colors.background} />
                  ) : (
                    <Text style={styles.saveButtonText}>Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Locations List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YOUR LOCATIONS</Text>

            {locations.map(location => (
              <View key={location.id} style={styles.locationCard}>
                <View style={styles.locationContent}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  {location.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <View style={styles.locationActions}>
                  {!location.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(location.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionButtonText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteIconButton}
                    onPress={() => handleDeleteLocation(location.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: theme.colors.primary[500],
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: theme.spacing[6],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.xl,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: theme.spacing[3],
  },
  infoText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  addForm: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
    padding: theme.spacing[5],
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  input: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing[4],
  },
  addFormButtons: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing[4],
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...theme.typography.styles.label,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  saveButton: {
    flex: 1,
    paddingVertical: theme.spacing[4],
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...theme.typography.styles.label,
    color: theme.colors.background,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[5],
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.md,
  },
  defaultBadgeText: {
    ...theme.typography.styles.caption,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  locationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  actionButton: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
  },
  actionButtonText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  deleteIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
