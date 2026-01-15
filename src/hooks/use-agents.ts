import type {
  AgentDepositDto,
  AgentPanelDto,
  AgentStatus,
  AgentWithdrawDto,
  ChatWizardRequest,
  CreateAgentDto,
  GenerateFromChatRequest,
  OptimizeStrategyRequest,
  TransactionType,
  UpdateAgentDto,
} from "@/types/api";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { agentApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth";

/**
 * Query keys for agents
 */
export const agentKeys = {
  all: ["agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: (status?: AgentStatus) => [...agentKeys.lists(), { status }] as const,
  active: () => [...agentKeys.all, "active"] as const,
  details: () => [...agentKeys.all, "detail"] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  panels: () => [...agentKeys.all, "panel"] as const,
  panel: (id: string) => [...agentKeys.panels(), id] as const,
  trenches: (id: string) => [...agentKeys.detail(id), "trenches"] as const,
  transactions: (id: string) =>
    [...agentKeys.detail(id), "transactions"] as const,
  logos: () => [...agentKeys.all, "logos"] as const,
  promptTemplate: () => [...agentKeys.all, "promptTemplate"] as const,
};

/**
 * Hook for getting all agents for current user
 * @param status - Optional status filter
 * @param options - Optional settings
 * @param options.polling - Enable polling for real-time updates (e.g., WAITING -> ACTIVE transition)
 */
export function useMyAgents(
  status?: AgentStatus,
  options?: { polling?: boolean }
) {
  const { isAuthenticated } = useAuthStore();
  const { polling = false } = options ?? {};

  return useQuery({
    queryKey: agentKeys.list(status),
    queryFn: () => agentApi.getMyAgents(status),
    enabled: isAuthenticated,
    // Poll every 10 seconds when polling is enabled (for WAITING -> ACTIVE transitions)
    refetchInterval: polling ? 10 * 1000 : false,
    staleTime: polling ? 5 * 1000 : undefined,
  });
}

/**
 * Hook for getting active agents
 */
export function useActiveAgents() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: agentKeys.active(),
    queryFn: () => agentApi.getActiveAgents(),
    enabled: isAuthenticated,
  });
}

/**
 * Hook for getting agent by ID
 */
export function useAgent(id: string | undefined) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: agentKeys.detail(id!),
    queryFn: () => agentApi.getAgentById(id!),
    enabled: isAuthenticated && !!id,
  });
}

/**
 * Hook for getting agent panel
 */
export function useAgentPanel(id: string | undefined) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: agentKeys.panel(id!),
    queryFn: () => agentApi.getAgentPanel(id!),
    enabled: isAuthenticated && !!id,
    // Panel data should refresh more frequently
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook for creating an agent
 */
export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentDto) => agentApi.createAgent(data),
    onSuccess: async () => {
      // Wait for the agents list to be refetched before continuing
      // This ensures navigation to /my-agent works correctly
      await queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      await queryClient.refetchQueries({ queryKey: agentKeys.lists() });
    },
  });
}

/**
 * Hook for updating an agent
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgentDto }) =>
      agentApi.updateAgent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.panel(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
}

/**
 * Hook for deleting an agent
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => agentApi.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
}

/**
 * Hook for toggling agent status
 */
export function useToggleAgentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, immediate }: { id: string; immediate?: boolean }) =>
      agentApi.toggleStatus(id, immediate),
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: agentKeys.panel(id) });

      // Get current panel state
      const previousPanel = queryClient.getQueryData<AgentPanelDto>(
        agentKeys.panel(id),
      );

      // Optimistically update the panel
      if (previousPanel) {
        queryClient.setQueryData<AgentPanelDto>(agentKeys.panel(id), (old) => {
          if (!old) return old;

          return {
            ...old,
            status: old.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
          };
        });
      }

      return { previousPanel };
    },
    onError: (_, { id }, context) => {
      // Rollback on error
      if (context?.previousPanel) {
        queryClient.setQueryData(agentKeys.panel(id), context.previousPanel);
      }
    },
    onSettled: (_, __, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: agentKeys.panel(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
    },
  });
}

/**
 * Hook for depositing to an agent
 */
export function useAgentDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AgentDepositDto }) =>
      agentApi.deposit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.panel(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
    },
  });
}

/**
 * Hook for withdrawing from an agent
 */
export function useAgentWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AgentWithdrawDto }) =>
      agentApi.withdraw(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.panel(id) });
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) });
    },
  });
}

/**
 * Hook for getting agent's trench history
 */
export function useAgentTrenches(
  id: string | undefined,
  params?: { status?: string; page?: number; limit?: number },
) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [...agentKeys.trenches(id!), params],
    queryFn: () => agentApi.getAgentTrenches(id!, params),
    enabled: isAuthenticated && !!id,
  });
}

/**
 * Hook for getting agent's transactions
 */
export function useAgentTransactions(
  id: string | undefined,
  params?: {
    trenchId?: number;
    txType?: TransactionType;
    page?: number;
    limit?: number;
  },
) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [...agentKeys.transactions(id!), params],
    queryFn: () => agentApi.getAgentTransactions(id!, params),
    enabled: isAuthenticated && !!id,
  });
}

/**
 * Hook for getting agent logos
 * Note: This is a public API that doesn't require authentication
 */
export function useAgentLogos() {
  return useQuery({
    queryKey: agentKeys.logos(),
    queryFn: () => agentApi.getAgentLogos(),
    staleTime: 60 * 60 * 1000, // 1 hour - logos don't change often
  });
}

/**
 * Hook for getting the default prompt template
 */
export function usePromptTemplate() {
  return useQuery({
    queryKey: agentKeys.promptTemplate(),
    queryFn: () => agentApi.getPromptTemplate(),
    staleTime: 60 * 60 * 1000, // 1 hour - template doesn't change often
  });
}

/**
 * Hook for uploading a custom avatar
 */
export function useUploadAvatar() {
  return useMutation({
    mutationFn: (file: File) => agentApi.uploadAvatar(file),
  });
}

/**
 * Hook for chat-based strategy wizard
 * 对话式策略向导
 */
export function useChatWizard() {
  return useMutation({
    mutationFn: (data: ChatWizardRequest) => agentApi.chatWizard(data),
  });
}

/**
 * Hook for generating strategy from chat wizard
 * 根据对话向导收集的答案生成策略
 */
export function useGenerateFromChat() {
  return useMutation({
    mutationFn: (data: GenerateFromChatRequest) =>
      agentApi.generateFromChat(data),
  });
}

/**
 * Hook for optimizing strategy prompt using AI
 * 使用 AI 根据用户自然语言输入优化策略 Prompt
 */
export function useOptimizeStrategy() {
  return useMutation({
    mutationFn: (data: OptimizeStrategyRequest) =>
      agentApi.optimizeStrategy(data),
  });
}
