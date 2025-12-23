import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apiClient } from "@/services/api/client";

/**
 * User information from backend
 */
export interface User {
  id: string;
  walletAddress: string;
  chainType: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login response from backend
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

/**
 * Auth store state
 */
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  login: (response: LoginResponse) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

/**
 * Auth store with persistence
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setUser: (user) => {
        set({ user });
      },

      login: (response) => {
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      refresh: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        try {
          // Call refresh endpoint directly to avoid interceptor loop
          const response = await apiClient.post<LoginResponse>(
            "/api/auth/refresh",
            {
              refreshToken,
            },
          );

          const data = response.data;

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
            isAuthenticated: true,
          });
        } catch {
          // Refresh failed, logout
          get().logout();
          throw new Error("Token refresh failed");
        }
      },
    }),
    {
      name: "eva-auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
