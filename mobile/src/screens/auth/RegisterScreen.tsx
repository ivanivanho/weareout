import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../../contexts/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface RegisterScreenProps {
  navigation: any; // Replace with proper navigation type from @react-navigation/native
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const {register, isLoading, error, clearError} = useAuth();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Clear errors when user starts typing
    if (error) {
      clearError();
    }
  }, [formData, error, clearError]);

  const validateFullName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Full name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return undefined;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string,
  ): string | undefined => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.password,
        formData.confirmPassword,
      ),
    };

    setFormErrors(errors);
    return (
      !errors.fullName &&
      !errors.email &&
      !errors.password &&
      !errors.confirmPassword
    );
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));

    // Real-time validation for touched fields
    if (touched[field]) {
      switch (field) {
        case 'fullName':
          setFormErrors(prev => ({...prev, fullName: validateFullName(value)}));
          break;
        case 'email':
          setFormErrors(prev => ({...prev, email: validateEmail(value)}));
          break;
        case 'password':
          setFormErrors(prev => ({...prev, password: validatePassword(value)}));
          // Also revalidate confirm password if it's been touched
          if (touched.confirmPassword) {
            setFormErrors(prev => ({
              ...prev,
              confirmPassword: validateConfirmPassword(
                value,
                formData.confirmPassword,
              ),
            }));
          }
          break;
        case 'confirmPassword':
          setFormErrors(prev => ({
            ...prev,
            confirmPassword: validateConfirmPassword(formData.password, value),
          }));
          break;
      }
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({...prev, [field]: true}));

    // Validate on blur
    switch (field) {
      case 'fullName':
        setFormErrors(prev => ({
          ...prev,
          fullName: validateFullName(formData.fullName),
        }));
        break;
      case 'email':
        setFormErrors(prev => ({
          ...prev,
          email: validateEmail(formData.email),
        }));
        break;
      case 'password':
        setFormErrors(prev => ({
          ...prev,
          password: validatePassword(formData.password),
        }));
        break;
      case 'confirmPassword':
        setFormErrors(prev => ({
          ...prev,
          confirmPassword: validateConfirmPassword(
            formData.password,
            formData.confirmPassword,
          ),
        }));
        break;
    }
  };

  const handleRegister = async () => {
    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      // Navigation will be handled by auth state change
    } catch (err: any) {
      Alert.alert(
        'Registration Failed',
        err.message || 'Unable to create account. Please try again.',
        [{text: 'OK'}],
      );
    }
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Sign up to get started with WeAreOut
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={value => handleInputChange('fullName', value)}
              onBlur={() => handleBlur('fullName')}
              error={touched.fullName ? formErrors.fullName : undefined}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              editable={!isLoading}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={value => handleInputChange('email', value)}
              onBlur={() => handleBlur('email')}
              error={touched.email ? formErrors.email : undefined}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              editable={!isLoading}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={value => handleInputChange('password', value)}
              onBlur={() => handleBlur('password')}
              error={touched.password ? formErrors.password : undefined}
              secureTextEntry
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="next"
              editable={!isLoading}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={value => handleInputChange('confirmPassword', value)}
              onBlur={() => handleBlur('confirmPassword')}
              error={
                touched.confirmPassword ? formErrors.confirmPassword : undefined
              }
              secureTextEntry
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              editable={!isLoading}
            />

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <Text style={styles.requirementText}>• At least 8 characters</Text>
              <Text style={styles.requirementText}>
                • One uppercase and lowercase letter
              </Text>
              <Text style={styles.requirementText}>• One number</Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={handleNavigateToLogin}
              activeOpacity={0.7}
              disabled={isLoading}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  form: {
    flex: 1,
  },
  passwordRequirements: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginTop: -8,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
    lineHeight: 18,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  loginLink: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default RegisterScreen;
