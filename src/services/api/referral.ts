import type {
  ReferralInfoDto,
  ReferralStatsDto,
  ReferredUserDto,
  PointsHistoryItemDto,
  ValidateCodeResponseDto,
  ReferralLeaderboardItemDto,
} from "@/types/api";

import { apiClient } from "./client";

export const referralApi = {
  getMyReferral: async (): Promise<ReferralInfoDto> => {
    const response = await apiClient.get<ReferralInfoDto>(
      "/api/referral/me",
    );
    return response.data;
  },

  getStats: async (): Promise<ReferralStatsDto> => {
    const response = await apiClient.get<ReferralStatsDto>(
      "/api/referral/stats",
    );
    return response.data;
  },

  getReferredUsers: async (
    page = 1,
    limit = 20,
  ): Promise<{ users: ReferredUserDto[]; total: number }> => {
    const response = await apiClient.get<{
      users: ReferredUserDto[];
      total: number;
    }>("/api/referral/referred-users", {
      params: { page, limit },
    });
    return response.data;
  },

  getPointsHistory: async (
    page = 1,
    limit = 20,
  ): Promise<{ items: PointsHistoryItemDto[]; total: number }> => {
    const response = await apiClient.get<{
      items: PointsHistoryItemDto[];
      total: number;
    }>("/api/referral/points-history", {
      params: { page, limit },
    });
    return response.data;
  },

  validateCode: async (code: string): Promise<ValidateCodeResponseDto> => {
    const response = await apiClient.get<ValidateCodeResponseDto>(
      `/api/referral/validate/${code}`,
    );
    return response.data;
  },

  getLeaderboard: async (
    limit = 20,
  ): Promise<ReferralLeaderboardItemDto[]> => {
    const response = await apiClient.get<ReferralLeaderboardItemDto[]>(
      "/api/referral/leaderboard",
      { params: { limit } },
    );
    return response.data;
  },
};
