/**
 * Wool Economy Service
 * Handles wool balance, collection, and transactions
 */

import { apiClient } from './api';

export interface WoolBalanceResponse {
  user_id: string;
  wool_balance: number;
  generation_rate_per_hour: number;
  last_updated: string;
}

export interface WoolCollectionResponse {
  wool_collected: number;
  new_balance: number;
  sheep_count: number;
}

export interface WoolTransactionResponse {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  source: string;
  reference_id?: string;
  created_at: string;
}

export interface PurchaseResponse {
  success: boolean;
  new_balance: number;
  item_id: string;
  amount_spent: number;
}

export const woolService = {
  /**
   * Get current wool balance and generation rate
   */
  async getBalance(userId: string): Promise<WoolBalanceResponse> {
    return apiClient.get<WoolBalanceResponse>(`/wool/balance/${userId}`);
  },

  /**
   * Manually collect wool from all sheep
   */
  async collectWool(userId: string): Promise<WoolCollectionResponse> {
    return apiClient.post<WoolCollectionResponse>(`/wool/collect/${userId}`);
  },

  /**
   * Get wool transaction history
   */
  async getTransactions(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<WoolTransactionResponse[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return apiClient.get<WoolTransactionResponse[]>(
      `/wool/transactions/${userId}?${params.toString()}`
    );
  },

  /**
   * Purchase an item with wool
   */
  async purchase(
    userId: string,
    itemId: string,
    amount: number
  ): Promise<PurchaseResponse> {
    const params = new URLSearchParams({
      user_id: userId,
      item_id: itemId,
      amount: amount.toString(),
    });
    return apiClient.post<PurchaseResponse>(`/wool/purchase?${params.toString()}`);
  },
};