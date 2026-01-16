import type { TransactionType, TrenchStatus } from "@/types/api";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { trenchApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth";

/**
 * Polling configuration
 * Change this value to adjust the polling interval for all trench-related queries
 */
export const POLLING_INTERVAL = 5000; // milliseconds

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
  pnlTimeline: () => [...trenchKeys.all, "pnlTimeline"] as const,
  history: (params?: { page?: number; limit?: number }) =>
    [...trenchKeys.all, "history", params] as const,
  historyInfinite: (limit: number) =>
    [...trenchKeys.all, "historyInfinite", limit] as const,
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
 * @param options - Additional options
 * @param options.polling - Whether to poll for updates (default: true)
 */
export function useCurrentTrench(options?: { polling?: boolean }) {
  const polling = options?.polling ?? true;

  return useQuery({
    queryKey: trenchKeys.current(),
    queryFn: () => trenchApi.getCurrentTrench(),
    staleTime: polling ? 0 : undefined, // Fresh data when polling, use default staleTime otherwise
    refetchInterval: polling ? POLLING_INTERVAL : false,
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
 * @param trenchId - The trench ID
 * @param params - Query parameters
 * @param options - Additional options
 * @param options.polling - Whether to poll for updates (default: true)
 */
export function useTrenchTransactions(
  trenchId: number | undefined,
  params?: {
    userAddress?: string;
    txType?: TransactionType[];
    page?: number;
    limit?: number;
  },
  options?: {
    polling?: boolean;
  },
) {
  const polling = options?.polling ?? true;

  return useQuery({
    queryKey: [...trenchKeys.transactions(trenchId!), params],
    queryFn: () => trenchApi.getTransactions(trenchId!, params),
    enabled: !!trenchId,
    staleTime: polling ? 0 : undefined,
    refetchInterval: polling ? POLLING_INTERVAL : false,
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
 * Uses the provided userAddress, or falls back to current user's turnkeyAddress.
 *
 * @param trenchId - The trench ID
 * @param params - Query parameters
 * @param params.userAddress - Optional specific user address (e.g., agent's turnkeyAddress)
 * @param options - Additional options
 * @param options.polling - Whether to poll for updates (default: true)
 */
export function useUserTransactions(
  trenchId: number | undefined,
  params?: {
    userAddress?: string;
    txType?: TransactionType[];
    page?: number;
    limit?: number;
  },
  options?: {
    polling?: boolean;
  },
) {
  const { user } = useAuthStore();
  // Use provided userAddress, or fall back to user's turnkeyAddress
  const userAddress = params?.userAddress ?? user?.turnkeyAddress;
  const polling = options?.polling ?? true;

  return useQuery({
    queryKey: [...trenchKeys.transactions(trenchId!), "user", userAddress, params],
    queryFn: () =>
      trenchApi.getTransactions(trenchId!, { ...params, userAddress }),
    enabled: !!trenchId && !!userAddress,
    staleTime: polling ? 0 : undefined,
    refetchInterval: polling ? POLLING_INTERVAL : false,
  });
}

/**
 * Hook for getting user's PNL timeline
 *
 * Returns PNL data points ordered by time ascending.
 * Only fetches when user is authenticated.
 */
export function useUserPnlTimeline() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: trenchKeys.pnlTimeline(),
    queryFn: () => trenchApi.getUserPnlTimeline(),
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for getting user's trench participation history
 *
 * Returns history ordered by time descending.
 * Only fetches when user is authenticated.
 */
export function useTrenchHistory(params?: { page?: number; limit?: number }) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: trenchKeys.history(params),
    queryFn: () => trenchApi.getTrenchHistory(params),
    enabled: isAuthenticated,
  });
}

/**
 * Hook for getting user's trench participation history with infinite scrolling
 *
 * Returns history ordered by time descending with pagination support.
 * Automatically fetches next page when scrolling to the bottom.
 *
 * @param limit - Number of items per page (default: 10)
 */
export function useTrenchHistoryInfinite(limit: number = 10) {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: trenchKeys.historyInfinite(limit),
    queryFn: async ({ pageParam }) => {
      return trenchApi.getTrenchHistory({ page: pageParam, limit });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentTotal = lastPage.page * lastPage.limit;

      if (currentTotal >= lastPage.total) {
        return undefined; // No more pages
      }

      return lastPage.page + 1;
    },
    enabled: isAuthenticated,
  });
}
