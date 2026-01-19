import type { ThinkReasonQueryDto } from "@/types/api";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { agentApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth";

/**
 * Query keys for think reasons
 */
export const thinkReasonKeys = {
  all: ["thinkReasons"] as const,
  list: (params?: ThinkReasonQueryDto) => [...thinkReasonKeys.all, "list", params] as const,
  infinite: (params?: Omit<ThinkReasonQueryDto, "page">) => [...thinkReasonKeys.all, "infinite", params] as const,
};

/**
 * Hook for getting agent think reasons (decision history)
 * 获取 Agent 的思考记录
 * 
 * @param params - Query parameters (trenchId, page, limit)
 * @param options - Optional settings
 * @param options.polling - Enable polling for real-time updates
 */
export function useThinkReasons(
  params?: ThinkReasonQueryDto,
  options?: { polling?: boolean }
) {
  const { isAuthenticated } = useAuthStore();
  const { polling = false } = options ?? {};

  return useQuery({
    queryKey: thinkReasonKeys.list(params),
    queryFn: () => agentApi.getThinkReasons(params),
    enabled: isAuthenticated,
    refetchInterval: polling ? 10 * 1000 : false,
    staleTime: polling ? 5 * 1000 : 30 * 1000,
  });
}

/**
 * Hook for getting the latest think reason
 * 获取最新一条思考记录
 */
export function useLatestThinkReason(options?: { polling?: boolean }) {
  const { isAuthenticated } = useAuthStore();
  const { polling = false } = options ?? {};

  return useQuery({
    queryKey: thinkReasonKeys.list({ page: 1, limit: 1 }),
    queryFn: () => agentApi.getThinkReasons({ page: 1, limit: 1 }),
    enabled: isAuthenticated,
    refetchInterval: polling ? 10 * 1000 : false,
    staleTime: polling ? 5 * 1000 : 30 * 1000,
    select: (data) => data.thinkReasons[0] ?? null,
  });
}

/**
 * Hook for infinite scrolling think reasons
 * 无限滚动加载思考记录
 */
export function useThinkReasonsInfinite(
  params?: Omit<ThinkReasonQueryDto, "page">,
  options?: { enabled?: boolean }
) {
  const { isAuthenticated } = useAuthStore();
  const { enabled = true } = options ?? {};
  const limit = params?.limit ?? 20;

  return useInfiniteQuery({
    queryKey: thinkReasonKeys.infinite(params),
    queryFn: ({ pageParam = 1 }) =>
      agentApi.getThinkReasons({ ...params, page: pageParam, limit }),
    enabled: isAuthenticated && enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((sum, page) => sum + page.thinkReasons.length, 0);
      if (totalLoaded >= lastPage.total) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: 30 * 1000,
  });
}
