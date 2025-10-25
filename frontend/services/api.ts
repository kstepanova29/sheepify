/**
 * API Service for Sheepify Backend Integration
 * Base URL configuration and axios instance setup
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API configuration
const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api/v1'  // Development
  : 'https://api.sheepify.com/api/v1';  // Production (update when deployed)

// Storage keys
const AUTH_TOKEN_KEY = '@sheepify_auth_token';
const USER_ID_KEY = '@sheepify_user_id';

// Platform-safe storage wrapper
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`[Storage] Failed to get item ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`[Storage] Failed to set item ${key}:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[Storage] Failed to remove item ${key}:`, error);
    }
  },
};

/**
 * API Client with authentication support
 */
class ApiClient {
  private baseURL: string;
  private userId: string | null = null;
  private authInitialized: boolean = false;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Don't call initializeAuth here - it will be called lazily when needed
  }

  private async initializeAuth() {
    if (this.authInitialized) return;

    try {
      console.log('[ApiClient] Initializing auth from storage...');
      this.userId = await storage.getItem(USER_ID_KEY);
      console.log('[ApiClient] Auth initialized, userId:', this.userId);
      this.authInitialized = true;
    } catch (error) {
      console.error('[ApiClient] Failed to load auth state:', error);
      this.authInitialized = true; // Mark as initialized even on error to avoid repeated attempts
    }
  }

  // Ensure auth is initialized before making requests
  private async ensureAuthInitialized() {
    if (!this.authInitialized) {
      await this.initializeAuth();
    }
  }

  async setUserId(userId: string) {
    console.log('[ApiClient] Setting userId:', userId);
    this.userId = userId;
    this.authInitialized = true;
    await storage.setItem(USER_ID_KEY, userId);
    console.log('[ApiClient] userId saved to storage');
  }

  async clearAuth() {
    console.log('[ApiClient] Clearing auth');
    this.userId = null;
    this.authInitialized = false;
    await storage.removeItem(USER_ID_KEY);
    await storage.removeItem(AUTH_TOKEN_KEY);
    console.log('[ApiClient] Auth cleared from storage');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      console.log(`[ApiClient] ${options.method || 'GET'} ${endpoint}`);
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: response.statusText,
        }));
        console.error(`[ApiClient] Request failed [${endpoint}]:`, error);
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`[ApiClient] Success [${endpoint}]`);
      return data;
    } catch (error) {
      console.error(`[ApiClient] API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async getUserId(): Promise<string | null> {
    await this.ensureAuthInitialized();
    return this.userId;
  }

  // Public method to explicitly initialize auth
  async initialize(): Promise<void> {
    await this.initializeAuth();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Re-export for convenience
export { AUTH_TOKEN_KEY, USER_ID_KEY, storage };