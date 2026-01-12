import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {authApi, tokenManager} from '../services/api';
import {
  User,
  LoginRequest,
  RegisterRequest,
  ApiError,
} from '../types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Check if user is already authenticated on app start
  const checkAuthStatus = useCallback(async () => {
    try {
      setState(prev => ({...prev, isLoading: true}));
      const accessToken = await tokenManager.getAccessToken();

      if (accessToken) {
        // Optionally: Verify token validity by calling a /me endpoint
        // For now, we'll assume if token exists, user is authenticated
        // You should implement a proper user info endpoint
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      console.log('🔐 [AuthContext] Starting login...');
      setState(prev => ({...prev, isLoading: true, error: null}));

      const response = await authApi.login(credentials);
      console.log('🔐 [AuthContext] Login successful, user:', response.user.email);

      // Verify token was stored
      const storedToken = await tokenManager.getAccessToken();
      console.log('🔐 [AuthContext] Token stored:', storedToken ? `${storedToken.substring(0, 30)}...` : 'NO TOKEN');

      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      console.error('❌ [AuthContext] Login error:', error);
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        error: apiError.message,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      setState(prev => ({...prev, isLoading: true, error: null}));

      const response = await authApi.register(data);

      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        error: apiError.message,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({...prev, isLoading: true}));

      await authApi.logout();

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if API call fails
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({...prev, error: null}));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
