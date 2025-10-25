/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserResponse, UserCreate, UserLogin } from '../services/authService';
import { USER_ID_KEY, storage } from '../services/api';

interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  login: (credentials: UserLogin) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('[AuthContext] ============ STATE ============');
  console.log('[AuthContext] User:', user ? `${user.username} (id: ${user.id})` : 'NULL');
  console.log('[AuthContext] Loading:', loading);
  console.log('[AuthContext] Error:', error);

  // Initialize auth state on mount
  useEffect(() => {
    console.log('[AuthContext] Initializing auth...');
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    console.log('[AuthContext] initializeAuth started');
    try {
      const userId = await storage.getItem(USER_ID_KEY);
      console.log('[AuthContext] Stored userId:', userId);

      if (userId) {
        console.log('[AuthContext] Fetching user profile for ID:', userId);
        const userData = await authService.getProfile(userId);
        console.log('[AuthContext] User profile fetched:', userData.username);
        setUser(userData);
      } else {
        console.log('[AuthContext] No stored userId found');
      }
    } catch (err) {
      console.error('[AuthContext] Failed to initialize auth:', err);
      // Clear invalid session
      await storage.removeItem(USER_ID_KEY);
    } finally {
      console.log('[AuthContext] initializeAuth complete, setting loading to false');
      setLoading(false);
    }
  };

  const login = async (credentials: UserLogin) => {
    console.log('[AuthContext] ============ LOGIN CALLED ============');
    console.log('[AuthContext] Username:', credentials.username);
    try {
      setLoading(true);
      setError(null);
      console.log('[AuthContext] Calling authService.login()...');
      const userData = await authService.login(credentials);
      console.log('[AuthContext] Login successful! User:', userData.username);
      console.log('[AuthContext] Setting user state...');
      setUser(userData);
      console.log('[AuthContext] User state set');
    } catch (err) {
      console.error('[AuthContext] Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      console.log('[AuthContext] Setting loading to false');
      setLoading(false);
    }
  };

  const register = async (data: UserCreate) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.register(data);
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const userData = await authService.getProfile(user.id);
      setUser(userData);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};