import type {
  LeaderboardResponseDto,
  PriceCurveResponseDto,
  TransactionListResponseDto,
  TransactionType,
  TrenchDetailDto,
  TrenchHistoryResponseDto,
  TrenchListResponseDto,
  TrenchStatus,
  UserPnlTimelineResponseDto,
} from "@/types/api";

import { apiClient } from "./client";

/**
 * User transaction summary
 */
export interface UserTrenchSummaryDto {
  trenchId: number;
  trenchPda: string;
  userAddress: string;
  totalDeposited: string;
  totalWithdrawn: string;
  totalBuySol: string;
  totalSellSol: string;
  transactionCount: number;
}

/**
 * Trench API service
 */
export const trenchApi = {
  /**
   * Get list of trenches with pagination
   */
  getTrenchList: async (params?: {
    status?: TrenchStatus;
    page?: number;
    limit?: number;
  }): Promise<TrenchListResponseDto> => {
    const response = await apiClient.get<TrenchListResponseDto>(
      "/api/trenches",
      {
        params,
      },
    );

    return response.data;
  },

  /**
   * Get current active trench (BIDDING or TRADING status)
   */
  getCurrentTrench: async (): Promise<TrenchDetailDto | null> => {
    const response = await apiClient.get<TrenchDetailDto | null>(
      "/api/trenches/current",
    );

    return response.data;
  },

  /**
   * Get trench detail by ID
   */
  getTrenchDetail: async (trenchId: number): Promise<TrenchDetailDto> => {
    const response = await apiClient.get<TrenchDetailDto>(
      `/api/trenches/${trenchId}`,
    );

    return response.data;
  },

  /**
   * Get price curve data for a trench
   */
  getPriceCurve: async (
    trenchId: number,
    unit?: "SOL" | "USDT",
  ): Promise<PriceCurveResponseDto> => {
    const response = await apiClient.get<PriceCurveResponseDto>(
      `/api/trenches/${trenchId}/price-curve`,
      {
        params: unit ? { unit } : undefined,
      },
    );

    return response.data;
  },

  /**
   * Get transactions for a trench
   */
  getTransactions: async (
    trenchId: number,
    params?: {
      userAddress?: string;
      txType?: TransactionType[];
      page?: number;
      limit?: number;
    },
  ): Promise<TransactionListResponseDto> => {
    const response = await apiClient.get<TransactionListResponseDto>(
      `/api/trenches/${trenchId}/transactions`,
      { params },
    );

    return response.data;
  },

  /**
   * Get user summary for a trench
   */
  getSummary: async (
    trenchId: number,
    userAddress?: string,
  ): Promise<UserTrenchSummaryDto> => {
    const response = await apiClient.get<UserTrenchSummaryDto>(
      `/api/trenches/${trenchId}/summary`,
      {
        params: userAddress ? { userAddress } : undefined,
      },
    );

    return response.data;
  },

  /**
   * Get leaderboard for a trench
   */
  getLeaderboard: async (trenchId: number): Promise<LeaderboardResponseDto> => {
    const response = await apiClient.get<LeaderboardResponseDto>(
      `/api/trenches/${trenchId}/leaderboard`,
    );

    return response.data;
  },

  /**
   * Get user PNL timeline
   * Returns PNL data points ordered by time ascending
   */
  getUserPnlTimeline: async (): Promise<UserPnlTimelineResponseDto> => {
    const response = await apiClient.get<UserPnlTimelineResponseDto>(
      "/api/trenches/pnl/timeline",
    );

    return response.data;
  },

  /**
   * Get user's trench participation history
   * Returns history ordered by time descending
   */
  getTrenchHistory: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<TrenchHistoryResponseDto> => {
    const response = await apiClient.get<TrenchHistoryResponseDto>(
      "/api/trenches/history",
      { params },
    );

    return response.data;
  },
};
