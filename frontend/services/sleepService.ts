/**
 * Sleep Tracking Service
 * Handles sleep session creation, completion, and history
 */

import { apiClient } from './api';

export interface SleepSessionCreate {
  planned_wake_time?: string;  // ISO 8601 format
  notes?: string;
}

export interface SleepSessionComplete {
  session_id: string;
  notes?: string;
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

export interface SleepCompleteResponse {
  session: SleepSessionResponse;
  quality_score: number;
  wool_earned: number;
  new_sheep_awarded?: SheepResponse;
  message: string;
}

export interface SleepSessionResponse {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration_hours?: number;
  quality_score?: number;
  reward_wool: number;
  new_sheep_awarded?: string;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface SleepStatsResponse {
  total_sessions: number;
  avg_duration: number;
  avg_quality: number;
  total_wool_earned: number;
  best_quality: number;
  recent_sessions: SleepSessionResponse[];
}

export const sleepService = {
  /**
   * Start a new sleep session
   */
  async startSession(userId: string, data?: SleepSessionCreate): Promise<SleepSessionResponse> {
    const params = new URLSearchParams({ user_id: userId });
    return apiClient.post<SleepSessionResponse>(
      `/sleep/start?${params.toString()}`,
      data
    );
  },

  /**
   * Complete a sleep session
   */
  async completeSession(data: SleepSessionComplete): Promise<SleepCompleteResponse> {
    return apiClient.post<SleepCompleteResponse>('/sleep/complete', data);
  },

  /**
   * Get active sleep session
   */
  async getActiveSession(userId: string): Promise<SleepSessionResponse | null> {
    try {
      return await apiClient.get<SleepSessionResponse>(`/sleep/active/${userId}`);
    } catch (error) {
      // No active session returns null
      return null;
    }
  },

  /**
   * Get sleep session history
   */
  async getSessions(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<SleepSessionResponse[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return apiClient.get<SleepSessionResponse[]>(
      `/sleep/sessions/${userId}?${params.toString()}`
    );
  },

  /**
   * Get weekly sleep statistics
   */
  async getWeeklyStats(userId: string): Promise<SleepStatsResponse> {
    return apiClient.get<SleepStatsResponse>(`/sleep/stats/weekly/${userId}`);
  },
};