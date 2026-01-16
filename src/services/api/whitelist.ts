import { apiClient } from "./client";

/**
 * Whitelist check response
 */
export interface WhitelistCheckResponseDto {
  /** Whether the user is in the alpha whitelist */
  isWhitelisted: boolean;
  /** Optional message for non-whitelisted users */
  message?: string;
}

/**
 * Whitelist API service
 */
export const whitelistApi = {
  /**
   * Check if current user is in the alpha whitelist
   * Requires authentication
   */
  checkWhitelist: async (): Promise<WhitelistCheckResponseDto> => {
    const response = await apiClient.get<WhitelistCheckResponseDto>(
      "/api/auth/whitelist",
    );

    return response.data;
  },
};
