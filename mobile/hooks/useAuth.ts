import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import AuthService, { User } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export type AuthContextType = AuthState & AuthActions;

export function useAuthLogic(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check persisted auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await AuthService.isAuthenticated();
        if (authenticated) {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.warn('Error verificando autenticación:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: loggedUser } = await AuthService.login(email, password);
      setUser(loggedUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } catch (err) {
      console.warn('Error al cerrar sesión:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    clearError,
  };
}

// Context for sharing auth state across the app
import React from 'react';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthLogic();
  return React.createElement(AuthContext.Provider, { value: auth }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
