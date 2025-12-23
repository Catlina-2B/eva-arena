import type { SolPriceResponseDto } from "@/types/api";

import { apiClient } from "./client";

/**
 * Price API service
 */
export const priceApi = {
  /**
   * Get current SOL/USD price
   */
  getSolPrice: async (): Promise<SolPriceResponseDto> => {
    const response = await apiClient.get<SolPriceResponseDto>("/api/price/sol");

    return response.data;
  },
};
