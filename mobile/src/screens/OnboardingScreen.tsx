import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { theme } from '../theme';

type OnboardingStep = 'welcome' | 'how-it-works';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');

  const WelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to WeAreOut</Text>
        <Text style={styles.description}>
          Your personal inventory concierge. We'll help you never run out of essentials again
          - without the mental burden of tracking everything.
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureCard}>
            <View style={styles.checkIcon}>
              <Text style={styles.checkText}>✓</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Zero-Effort Tracking</Text>
              <Text style={styles.featureDescription}>
                Snap photos, scan receipts, or connect your email - no manual entry needed
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.checkIcon}>
              <Text style={styles.checkText}>✓</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Predictive Intelligence</Text>
              <Text style={styles.featureDescription}>
                We learn your consumption patterns and predict when you'll run out
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.checkIcon}>
              <Text style={styles.checkText}>✓</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Proactive Shopping Lists</Text>
              <Text style={styles.featureDescription}>
                Automatic shopping lists based on what's running low, grouped by store
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setCurrentStep('how-it-works')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const HowItWorksStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>How WeAreOut Works</Text>
        <Text style={styles.description}>
          Three simple ways to keep your inventory up to date
        </Text>

        <View style={styles.methodsList}>
          <View style={styles.methodCard}>
            <View style={styles.methodIcon}>
              <Text style={styles.methodIconText}>📷</Text>
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>1. Snap Photos</Text>
              <Text style={styles.methodDescription}>
                Take a quick photo of your pantry, fridge, or bathroom shelves. Our AI
                identifies items and quantities automatically.
              </Text>
            </View>
          </View>

          <View style={styles.methodCard}>
            <View style={styles.methodIcon}>
              <Text style={styles.methodIconText}>🧾</Text>
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>2. Scan Receipts</Text>
              <Text style={styles.methodDescription}>
                Photo or digital receipts from any store. We extract items, quantities, and
                dates to track consumption patterns.
              </Text>
            </View>
          </View>

          <View style={styles.methodCard}>
            <View style={styles.methodIcon}>
              <Text style={styles.methodIconText}>📧</Text>
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>3. Connect Your Email</Text>
              <Text style={styles.methodDescription}>
                Automatically import digital receipts from Amazon, Instacart, and other
                retailers - completely hands-free.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setCurrentStep('welcome')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, styles.flexButton]}
          onPress={onComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Try a Test Scan →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {currentStep === 'welcome' ? <WelcomeStep /> : <HowItWorksStep />}
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
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[12],
  },
  title: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  description: {
    ...theme.typography.styles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing[10],
  },
  featuresList: {
    gap: theme.spacing[4],
  },
  featureCard: {
    flexDirection: 'row',
    padding: theme.spacing[5],
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.xl,
  },
  checkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.good.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[4],
  },
  checkText: {
    fontSize: 24,
    color: theme.colors.background,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...theme.typography.styles.h4,
    marginBottom: theme.spacing[2],
  },
  featureDescription: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  methodsList: {
    gap: theme.spacing[5],
  },
  methodCard: {
    padding: theme.spacing[5],
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
  },
  methodIconText: {
    fontSize: 28,
  },
  methodContent: {},
  methodTitle: {
    ...theme.typography.styles.h4,
    marginBottom: theme.spacing[2],
  },
  methodDescription: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[6],
  },
  primaryButton: {
    paddingVertical: theme.spacing[5],
    paddingHorizontal: theme.spacing[8],
    backgroundColor: theme.colors.text.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.background,
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: theme.spacing[5],
    paddingHorizontal: theme.spacing[8],
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...theme.typography.styles.bodySemibold,
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  flexButton: {
    flex: 1,
  },
});
