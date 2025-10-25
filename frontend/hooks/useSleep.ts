/**
 * Sleep Tracking Hook
 * Manages sleep session state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  sleepService,
  SleepSessionResponse,
  SleepCompleteResponse,
  SleepStatsResponse,
} from '../services/sleepService';
import { useAuth } from '../contexts/AuthContext';

export const useSleep = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<SleepSessionResponse | null>(null);
  const [sessions, setSessions] = useState<SleepSessionResponse[]>([]);
  const [stats, setStats] = useState<SleepStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load active session on mount
  useEffect(() => {
    if (user) {
      loadActiveSession();
      loadStats();
    }
  }, [user]);

  const loadActiveSession = async () => {
    if (!user) return;

    try {
      const session = await sleepService.getActiveSession(user.id);
      setActiveSession(session);
    } catch (err) {
      console.error('Failed to load active session:', err);
    }
  };

  const loadSessions = async (limit: number = 10, offset: number = 0) => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await sleepService.getSessions(user.id, limit, offset);
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const data = await sleepService.getWeeklyStats(user.id);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const startSession = async (plannedWakeTime?: Date): Promise<SleepSessionResponse> => {
    if (!user) throw new Error('User not authenticated');
    if (activeSession) throw new Error('Already have an active session');

    try {
      setLoading(true);
      setError(null);

      const session = await sleepService.startSession(user.id, {
        planned_wake_time: plannedWakeTime?.toISOString(),
      });

      setActiveSession(session);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async (notes?: string): Promise<SleepCompleteResponse> => {
    if (!user) throw new Error('User not authenticated');
    if (!activeSession) throw new Error('No active session');

    try {
      setLoading(true);
      setError(null);

      const result = await sleepService.completeSession({
        session_id: activeSession.id,
        notes,
      });

      setActiveSession(null);
      await loadStats(); // Refresh stats after completing session
      await loadSessions(); // Refresh session history

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = useCallback((): number => {
    if (!activeSession) return 0;

    const start = new Date(activeSession.start_time);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  }, [activeSession]);

  return {
    activeSession,
    sessions,
    stats,
    loading,
    error,
    startSession,
    completeSession,
    loadSessions,
    loadStats,
    calculateDuration,
    isActive: activeSession !== null,
  };
};