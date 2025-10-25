/**
 * Sheep Management Hook
 * Manages sheep collection and operations
 */

import { useState, useEffect } from 'react';
import { sheepService, SheepResponse } from '../services/sheepService';
import { useAuth } from '../contexts/AuthContext';

export const useSheep = () => {
  const { user } = useAuth();
  const [sheep, setSheep] = useState<SheepResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sheep on mount
  useEffect(() => {
    if (user) {
      loadSheep();
    }
  }, [user]);

  const loadSheep = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await sheepService.getUserSheep(user.id);
      setSheep(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sheep');
    } finally {
      setLoading(false);
    }
  };

  const renameSheep = async (sheepId: string, newName: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);

      const updated = await sheepService.renameSheep(sheepId, user.id, newName);

      // Update local state
      setSheep((prev) =>
        prev.map((s) => (s.id === sheepId ? updated : s))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rename sheep';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (sheepId: string, isFavorite: boolean): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);

      const updated = await sheepService.toggleFavorite(sheepId, user.id, isFavorite);

      // Update local state
      setSheep((prev) =>
        prev.map((s) => (s.id === sheepId ? updated : s))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update favorite';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSheepById = (sheepId: string): SheepResponse | undefined => {
    return sheep.find((s) => s.id === sheepId);
  };

  const getFavoriteSheep = (): SheepResponse[] => {
    return sheep.filter((s) => s.is_favorite);
  };

  const getTotalWoolRate = (): number => {
    return sheep.reduce((total, s) => total + s.current_wool_rate, 0);
  };

  return {
    sheep,
    loading,
    error,
    loadSheep,
    renameSheep,
    toggleFavorite,
    getSheepById,
    getFavoriteSheep,
    getTotalWoolRate,
    sheepCount: sheep.length,
  };
};