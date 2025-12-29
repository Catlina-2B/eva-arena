import type { LoginDto, LoginResponseDto, UserDto } from "@/types/api";

import { apiClient } from "./client";

/**
 * Authentication API service
 */
export const authApi = {
  /**
   * Login with wallet signature
   */
  login: async (data: LoginDto): Promise<LoginResponseDto> => {
    const response = await apiClient.post<LoginResponseDto>(
      "/api/auth/login",
      data,
    );

    return response.data;
  },

  /**
   * Refresh access token
   */
  refresh: async (refreshToken: string): Promise<LoginResponseDto> => {
    const response = await apiClient.post<LoginResponseDto>(
      "/api/auth/refresh",
      {
        refreshToken,
      },
    );

    return response.data;
  },

  /**
   * Get current user profile (via /auth/me)
   */
  getProfile: async (): Promise<UserDto> => {
    const response = await apiClient.get<UserDto>("/api/auth/me");

    return response.data;
  },
};
