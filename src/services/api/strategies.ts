import type {
  CreateStrategyDto,
  StrategyItemDto,
  StrategyListResponseDto,
  StrategyStatus,
  StrategyType,
  UpdateStrategyDto,
} from "@/types/api";

import { apiClient } from "./client";

/**
 * Strategy API service
 */
export const strategyApi = {
  /**
   * Get list of strategies with filters
   */
  getStrategies: async (params?: {
    type?: StrategyType;
    status?: StrategyStatus;
    keyword?: string;
    page?: number;
    limit?: number;
  }): Promise<StrategyListResponseDto> => {
    const response = await apiClient.get<StrategyListResponseDto>(
      "/api/strategies",
      {
        params,
      },
    );

    return response.data;
  },

  /**
   * Get public and enabled strategies
   */
  getPublicStrategies: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<StrategyListResponseDto> => {
    const response = await apiClient.get<StrategyListResponseDto>(
      "/api/strategies/public",
      {
        params,
      },
    );

    return response.data;
  },

  /**
   * Get strategy by ID
   */
  getStrategyById: async (id: string): Promise<StrategyItemDto> => {
    const response = await apiClient.get<StrategyItemDto>(
      `/api/strategies/${id}`,
    );

    return response.data;
  },

  /**
   * Create a new strategy
   */
  createStrategy: async (data: CreateStrategyDto): Promise<StrategyItemDto> => {
    const response = await apiClient.post<StrategyItemDto>(
      "/api/strategies",
      data,
    );

    return response.data;
  },

  /**
   * Update a strategy
   */
  updateStrategy: async (
    id: string,
    data: UpdateStrategyDto,
  ): Promise<StrategyItemDto> => {
    const response = await apiClient.put<StrategyItemDto>(
      `/api/strategies/${id}`,
      data,
    );

    return response.data;
  },

  /**
   * Delete a strategy
   */
  deleteStrategy: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/strategies/${id}`);
  },
};
