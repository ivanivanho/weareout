import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Voice from '@react-native-voice/voice';
import { theme } from '../theme';
import { aiApi } from '../services/ai.api';

/**
 * Voice Update Screen
 * Real-time voice recording and transcription for inventory updates
 */
export const VoiceUpdateScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Set up Voice recognition callbacks
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      // Cleanup
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const onSpeechStart = () => {
    console.log('🎤 [Voice] Speech started');
    setIsListening(true);
  };

  const onSpeechEnd = () => {
    console.log('🎤 [Voice] Speech ended');
    setIsListening(false);
  };

  const onSpeechResults = (event: any) => {
    const text = event.value[0];
    console.log('🎤 [Voice] Final results:', text);
    setTranscribedText(text);
  };

  const onSpeechPartialResults = (event: any) => {
    const text = event.value[0];
    console.log('🎤 [Voice] Partial results:', text);
    setTranscribedText(text);
  };

  const onSpeechError = (event: any) => {
    console.error('🎤 [Voice] Error:', event.error);
    setIsListening(false);

    if (event.error?.message !== 'No speech input') {
      Alert.alert('Error', 'Voice recognition failed. Please try again.');
    }
  };

  const startListening = async () => {
    try {
      setTranscribedText('');
      await Voice.start('en-US');
    } catch (error) {
      console.error('🎤 [Voice] Failed to start:', error);
      Alert.alert(
        'Permission Required',
        'Please enable microphone access in Settings to use voice updates.'
      );
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error('🎤 [Voice] Failed to stop:', error);
    }
  };

  const handleUpdate = async () => {
    if (!transcribedText.trim()) {
      Alert.alert('No Input', 'Please speak or tap the microphone to start');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('🗣️ [Voice Screen] Processing text:', transcribedText);
      const result = await aiApi.processVoiceToInventory(transcribedText);

      console.log('✅ [Voice Screen] AI result:', result);

      // Navigate to preview screen
      navigation.navigate('AIResultPreview', {
        result,
        source: 'voice',
        originalText: transcribedText,
      });
    } catch (error: any) {
      console.error('❌ [Voice Screen] Error:', error);
      Alert.alert(
        'Processing Failed',
        error.message || 'Failed to process voice input. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setTranscribedText('');
    setIsListening(false);
    Voice.cancel();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Voice Update</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.instructions}>
            {isListening ? 'Listening...' : 'Tap to speak'}
          </Text>
          <Text style={styles.subtitle}>
            {isListening
              ? 'Say what you need to add, update, or mark as out'
              : 'Tell us about your inventory changes'}
          </Text>

          {/* Listening Circle */}
          <View style={styles.circleContainer}>
            <TouchableOpacity
              style={styles.micButtonWrapper}
              onPress={isListening ? stopListening : startListening}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.micButton,
                  isListening && styles.micButtonListening,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Text style={styles.micIcon}>
                  {isListening ? '⏸' : '🎤'}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.micHint}>
              {isListening ? 'Tap to stop' : 'Tap to start'}
            </Text>
          </View>

          {/* Transcribed Text */}
          {transcribedText ? (
            <View style={styles.transcriptionContainer}>
              <Text style={styles.transcriptionLabel}>You said:</Text>
              <Text style={styles.transcriptionText}>"{transcribedText}"</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>Clear & Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>Try saying:</Text>
              <Text style={styles.exampleText}>• "We're out of milk"</Text>
              <Text style={styles.exampleText}>• "Add 2 pounds of ground beef"</Text>
              <Text style={styles.exampleText}>• "Bought a dozen eggs"</Text>
            </View>
          )}

          {/* Update Button */}
          {transcribedText && !isListening && (
            <TouchableOpacity
              style={[
                styles.updateButton,
                isProcessing && styles.updateButtonDisabled,
              ]}
              onPress={handleUpdate}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={theme.colors.background} size="small" />
              ) : (
                <Text style={styles.updateButtonText}>Update</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
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
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  title: {
    ...theme.typography.styles.h4,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[8],
  },
  instructions: {
    ...theme.typography.styles.h2,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    ...theme.typography.styles.body,
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[10],
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  micButtonWrapper: {
    marginBottom: theme.spacing[4],
  },
  micButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonListening: {
    backgroundColor: theme.colors.critical.DEFAULT,
  },
  micIcon: {
    fontSize: 56,
  },
  micHint: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  transcriptionContainer: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[6],
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  transcriptionLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  transcriptionText: {
    ...theme.typography.styles.h4,
    fontStyle: 'italic',
    marginBottom: theme.spacing[4],
  },
  resetButton: {
    alignSelf: 'flex-start',
  },
  resetButtonText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.primary[500],
  },
  examplesContainer: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[6],
  },
  examplesTitle: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
  },
  exampleText: {
    ...theme.typography.styles.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  updateButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing[5],
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: theme.spacing[6],
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.background,
    fontSize: 18,
  },
});
