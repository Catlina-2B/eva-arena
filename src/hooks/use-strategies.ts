import type {
  CreateStrategyDto,
  StrategyStatus,
  StrategyType,
  UpdateStrategyDto,
} from "@/types/api";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { strategyApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth";

/**
 * Query keys for strategies
 */
export const strategyKeys = {
  all: ["strategies"] as const,
  lists: () => [...strategyKeys.all, "list"] as const,
  list: (params?: {
    type?: StrategyType;
    status?: StrategyStatus;
    keyword?: string;
  }) => [...strategyKeys.lists(), params] as const,
  public: () => [...strategyKeys.all, "public"] as const,
  details: () => [...strategyKeys.all, "detail"] as const,
  detail: (id: string) => [...strategyKeys.details(), id] as const,
};

/**
 * Hook for getting strategies list
 */
export function useStrategies(params?: {
  type?: StrategyType;
  status?: StrategyStatus;
  keyword?: string;
  page?: number;
  limit?: number;
}) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: strategyKeys.list(params),
    queryFn: () => strategyApi.getStrategies(params),
    enabled: isAuthenticated,
  });
}

/**
 * Hook for getting public strategies
 */
export function usePublicStrategies(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...strategyKeys.public(), params],
    queryFn: () => strategyApi.getPublicStrategies(params),
  });
}

/**
 * Hook for getting strategy by ID
 */
export function useStrategy(id: string | undefined) {
  return useQuery({
    queryKey: strategyKeys.detail(id!),
    queryFn: () => strategyApi.getStrategyById(id!),
    enabled: !!id,
  });
}

/**
 * Hook for creating a strategy
 */
export function useCreateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStrategyDto) => strategyApi.createStrategy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.lists() });
    },
  });
}

/**
 * Hook for updating a strategy
 */
export function useUpdateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStrategyDto }) =>
      strategyApi.updateStrategy(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: strategyKeys.lists() });
    },
  });
}

/**
 * Hook for deleting a strategy
 */
export function useDeleteStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => strategyApi.deleteStrategy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.lists() });
    },
  });
}
