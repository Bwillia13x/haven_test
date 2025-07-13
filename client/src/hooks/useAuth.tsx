import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth, ApiError } from '../lib/api';
import { User, InsertUser } from '@shared/schema';

interface AuthState {
  user: Pick<User, 'id' | 'username'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await auth.getCurrentUser();
        setState({
          user: response.user,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await auth.login(username, password);
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Login failed. Please try again.');
      }
      throw error;
    }
  };

  const register = async (userData: InsertUser) => {
    try {
      setError(null);
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await auth.register(userData);
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await auth.logout();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      // Even if logout fails on server, clear local state
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      if (error instanceof ApiError) {
        setError(error.message);
      }
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protecting routes
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && !isAuthenticated,
  };
}
