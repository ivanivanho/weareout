import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';

interface InventoryUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  onScanCamera?: () => void;
  onVoiceUpdate?: () => void;
  onChoosePhotos?: () => void;
  onManualEntry?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const InventoryUpdateModal: React.FC<InventoryUpdateModalProps> = ({
  visible,
  onClose,
  onScanCamera,
  onVoiceUpdate,
  onChoosePhotos,
  onManualEntry,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modal}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Inventory Update</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>How would you like to update your inventory?</Text>

          {/* Options */}
          <View style={styles.options}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={onScanCamera}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.optionIconText}>📷</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Scan with Camera</Text>
                <Text style={styles.optionDescription}>
                  Take a photo of your groceries or receipts
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={onVoiceUpdate}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#F3E8FF' }]}>
                <Text style={styles.optionIconText}>🎤</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Voice Update</Text>
                <Text style={styles.optionDescription}>
                  Tell us what you need: "We're out of milk"
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={onChoosePhotos}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.optionIconText}>🖼️</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Choose from Photos</Text>
                <Text style={styles.optionDescription}>
                  Upload an existing receipt or photo
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={onManualEntry}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.optionIconText}>✏️</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Manual Entry</Text>
                <Text style={styles.optionDescription}>
                  Add or update items manually
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius['3xl'],
    borderTopRightRadius: theme.borderRadius['3xl'],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[10],
    minHeight: SCREEN_HEIGHT * 0.6,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.gray[300],
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: theme.spacing[5],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  title: {
    ...theme.typography.styles.h3,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: theme.colors.text.secondary,
  },
  subtitle: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[8],
  },
  options: {
    paddingHorizontal: theme.spacing[6],
    gap: theme.spacing[4],
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[5],
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[4],
  },
  optionIconText: {
    fontSize: 32,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...theme.typography.styles.h4,
    marginBottom: theme.spacing[1],
  },
  optionDescription: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
});
