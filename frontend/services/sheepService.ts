/**
 * Sheep Management Service
 * Handles sheep creation, fetching, and updates
 */

import { apiClient } from './api';

export interface SheepCreate {
  sheep_type_id?: string;
  custom_name?: string;
}

export interface SheepUpdate {
  custom_name?: string;
  is_favorite?: boolean;
}

export interface SheepResponse {
  id: string;
  user_id: string;
  sheep_type_id: string;
  custom_name: string;
  level: number;
  experience: number;
  wool_rate_modifier: number;
  date_acquired: string;
  is_favorite: boolean;
  total_wool_generated: number;
  current_wool_rate: number;
}

export const sheepService = {
  /**
   * Create a new sheep (admin/reward only)
   */
  async createSheep(userId: string, data?: SheepCreate): Promise<SheepResponse> {
    const params = new URLSearchParams({ user_id: userId });
    return apiClient.post<SheepResponse>(
      `/sheep/create?${params.toString()}`,
      data
    );
  },

  /**
   * Get all sheep for a user
   */
  async getUserSheep(userId: string): Promise<SheepResponse[]> {
    return apiClient.get<SheepResponse[]>(`/sheep/user/${userId}`);
  },

  /**
   * Get a specific sheep by ID
   */
  async getSheep(sheepId: string): Promise<SheepResponse> {
    return apiClient.get<SheepResponse>(`/sheep/${sheepId}`);
  },

  /**
   * Update sheep properties (name, favorite status)
   */
  async updateSheep(
    sheepId: string,
    userId: string,
    data: SheepUpdate
  ): Promise<SheepResponse> {
    const params = new URLSearchParams({ user_id: userId });
    return apiClient.patch<SheepResponse>(
      `/sheep/${sheepId}?${params.toString()}`,
      data
    );
  },

  /**
   * Toggle favorite status for a sheep
   */
  async toggleFavorite(
    sheepId: string,
    userId: string,
    isFavorite: boolean
  ): Promise<SheepResponse> {
    return this.updateSheep(sheepId, userId, { is_favorite: isFavorite });
  },

  /**
   * Rename a sheep
   */
  async renameSheep(
    sheepId: string,
    userId: string,
    newName: string
  ): Promise<SheepResponse> {
    return this.updateSheep(sheepId, userId, { custom_name: newName });
  },
};