/**
 * Wool Economy Hook
 * Manages wool balance, collection, and transactions
 */

import { useState, useEffect, useCallback } from 'react';
import {
  woolService,
  WoolBalanceResponse,
  WoolTransactionResponse,
} from '../services/woolService';
import { useAuth } from '../contexts/AuthContext';

export const useWool = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WoolBalanceResponse | null>(null);
  const [transactions, setTransactions] = useState<WoolTransactionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load balance on mount and periodically
  useEffect(() => {
    if (user) {
      loadBalance();

      // Refresh balance every 30 seconds
      const interval = setInterval(loadBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadBalance = async () => {
    if (!user) return;

    try {
      const data = await woolService.getBalance(user.id);
      setBalance(data);
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  const loadTransactions = async (limit: number = 20, offset: number = 0) => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await woolService.getTransactions(user.id, limit, offset);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const collectWool = async (): Promise<number> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);

      const result = await woolService.collectWool(user.id);
      await loadBalance(); // Refresh balance

      return result.wool_collected;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to collect wool';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const purchase = async (itemId: string, amount: number): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    if (!balance || balance.wool_balance < amount) {
      throw new Error('Insufficient wool');
    }

    try {
      setLoading(true);
      setError(null);

      await woolService.purchase(user.id, itemId, amount);
      await loadBalance(); // Refresh balance
      await loadTransactions(); // Refresh transaction history
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const canAfford = useCallback(
    (amount: number): boolean => {
      return balance ? balance.wool_balance >= amount : false;
    },
    [balance]
  );

  return {
    balance: balance?.wool_balance ?? 0,
    generationRate: balance?.generation_rate_per_hour ?? 0,
    transactions,
    loading,
    error,
    loadBalance,
    loadTransactions,
    collectWool,
    purchase,
    canAfford,
  };
};