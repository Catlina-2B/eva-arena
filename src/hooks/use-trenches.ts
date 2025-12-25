import type { TransactionType, TrenchStatus } from "@/types/api";

import { useQuery } from "@tanstack/react-query";

import { trenchApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth";

/**
 * Polling configuration
 * Change this value to adjust the polling interval for all trench-related queries
 */
export const POLLING_INTERVAL = 500; // milliseconds

/**
 * Query keys for trenches
 */
export const trenchKeys = {
  all: ["trenches"] as const,
  lists: () => [...trenchKeys.all, "list"] as const,
  list: (params?: { status?: TrenchStatus; page?: number; limit?: number }) =>
    [...trenchKeys.lists(), params] as const,
  current: () => [...trenchKeys.all, "current"] as const,
  details: () => [...trenchKeys.all, "detail"] as const,
  detail: (id: number) => [...trenchKeys.details(), id] as const,
  priceCurve: (id: number, unit?: string) =>
    [...trenchKeys.detail(id), "priceCurve", unit] as const,
  transactions: (id: number) =>
    [...trenchKeys.detail(id), "transactions"] as const,
  leaderboard: (id: number) =>
    [...trenchKeys.detail(id), "leaderboard"] as const,
  summary: (id: number, userAddress?: string) =>
    [...trenchKeys.detail(id), "summary", userAddress] as const,
};

/**
 * Hook for getting trench list with pagination
 */
export function useTrenchList(params?: {
  status?: TrenchStatus;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: trenchKeys.list(params),
    queryFn: () => trenchApi.getTrenchList(params),
  });
}

/**
 * Hook for getting current active trench
 *
 * Polls every 500ms for real-time updates
 */
export function useCurrentTrench() {
  return useQuery({
    queryKey: trenchKeys.current(),
    queryFn: () => trenchApi.getCurrentTrench(),
    staleTime: 0, // Always fetch fresh data
    refetchInterval: POLLING_INTERVAL,
  });
}

/**
 * Hook for getting trench detail
 */
export function useTrenchDetail(trenchId: number | undefined) {
  return useQuery({
    queryKey: trenchKeys.detail(trenchId!),
    queryFn: () => trenchApi.getTrenchDetail(trenchId!),
    enabled: !!trenchId,
    staleTime: 10 * 1000, // 10 seconds
  });
}

/**
 * Hook for getting price curve data
 *
 * Polls every 500ms for real-time updates
 */
export function usePriceCurve(
  trenchId: number | undefined,
  unit?: "SOL" | "USDT",
) {
  return useQuery({
    queryKey: trenchKeys.priceCurve(trenchId!, unit),
    queryFn: () => trenchApi.getPriceCurve(trenchId!, unit),
    enabled: !!trenchId,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: POLLING_INTERVAL,
  });
}

/**
 * Hook for getting trench transactions
 *
 * Polls every 500ms for real-time updates
 */
export function useTrenchTransactions(
  trenchId: number | undefined,
  params?: {
    userAddress?: string;
    txType?: TransactionType[];
    page?: number;
    limit?: number;
  },
) {
  return useQuery({
    queryKey: [...trenchKeys.transactions(trenchId!), params],
    queryFn: () => trenchApi.getTransactions(trenchId!, params),
    enabled: !!trenchId,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: POLLING_INTERVAL,
  });
}

/**
 * Hook for getting leaderboard
 *
 * Polls every 500ms for real-time updates
 */
export function useLeaderboard(trenchId: number | undefined) {
  return useQuery({
    queryKey: trenchKeys.leaderboard(trenchId!),
    queryFn: () => trenchApi.getLeaderboard(trenchId!),
    enabled: !!trenchId,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: POLLING_INTERVAL,
  });
}

/**
 * Hook for getting user summary in a trench
 */
export function useTrenchSummary(
  trenchId: number | undefined,
  userAddress?: string,
) {
  return useQuery({
    queryKey: trenchKeys.summary(trenchId!, userAddress),
    queryFn: () => trenchApi.getSummary(trenchId!, userAddress),
    enabled: !!trenchId,
  });
}

/**
 * Hook for getting current user's transactions in a trench
 *
 * Automatically uses the logged-in user's wallet address.
 * Polls every 500ms for real-time updates.
 */
export function useUserTransactions(
  trenchId: number | undefined,
  params?: {
    txType?: TransactionType[];
    page?: number;
    limit?: number;
  },
) {
  const { user } = useAuthStore();
  const userAddress = user?.walletAddress;

  return useQuery({
    queryKey: [...trenchKeys.transactions(trenchId!), "user", userAddress, params],
    queryFn: () =>
      trenchApi.getTransactions(trenchId!, { ...params, userAddress }),
    enabled: !!trenchId && !!userAddress,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: POLLING_INTERVAL,
  });
}
