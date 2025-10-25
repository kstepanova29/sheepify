/**
 * Authentication Service
 * Handles user registration, login, and profile management
 */

import { apiClient } from './api';

export interface UserCreate {
  username: string;
  password: string;
  email?: string;
  farm_name?: string;
  sleep_goal_hours?: number;
  target_bedtime?: string;
  target_wake_time?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email?: string;
  farm_name: string;
  wool_balance: number;
  sleep_goal_hours: number;
  target_bedtime?: string;
  target_wake_time?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(data: UserCreate): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>('/auth/register', data);
    await apiClient.setUserId(response.id);
    return response;
  },

  /**
   * Login existing user
   */
  async login(credentials: UserLogin): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>('/auth/login', credentials);
    await apiClient.setUserId(response.id);
    return response;
  },

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/auth/user/${userId}`);
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.clearAuth();
  },

  /**
   * Get current user ID from storage
   */
  getCurrentUserId(): string | null {
    return apiClient.getUserId();
  },
};