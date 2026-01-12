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

interface LoginScreenProps {
  navigation: any; // Replace with proper navigation type from @react-navigation/native
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {login, isLoading, error, clearError} = useAuth();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Clear errors when user starts typing
    if (error) {
      clearError();
    }
  }, [formData, error, clearError]);

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
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));

    // Real-time validation for touched fields
    if (touched[field]) {
      if (field === 'email') {
        setFormErrors(prev => ({...prev, email: validateEmail(value)}));
      } else if (field === 'password') {
        setFormErrors(prev => ({...prev, password: validatePassword(value)}));
      }
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({...prev, [field]: true}));

    // Validate on blur
    if (field === 'email') {
      setFormErrors(prev => ({...prev, email: validateEmail(formData.email)}));
    } else if (field === 'password') {
      setFormErrors(prev => ({
        ...prev,
        password: validatePassword(formData.password),
      }));
    }
  };

  const handleLogin = async () => {
    // Mark all fields as touched
    setTouched({email: true, password: true});

    if (!validateForm()) {
      return;
    }

    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      // Navigation will be handled by auth state change
    } catch (err: any) {
      Alert.alert(
        'Login Failed',
        err.message || 'Unable to login. Please try again.',
        [{text: 'OK'}],
      );
    }
  };

  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality will be implemented soon.',
      [{text: 'OK'}],
    );
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to WeAreOut
            </Text>
          </View>

          <View style={styles.form}>
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
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={value => handleInputChange('password', value)}
              onBlur={() => handleBlur('password')}
              error={touched.password ? formErrors.password : undefined}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              editable={!isLoading}
            />

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPassword}
              activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={handleNavigateToRegister}
              activeOpacity={0.7}
              disabled={isLoading}>
              <Text style={styles.registerLink}>Sign Up</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 32,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  loginButton: {
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
  registerLink: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default LoginScreen;
