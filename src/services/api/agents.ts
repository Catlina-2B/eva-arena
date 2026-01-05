import type {
  AgentDepositDto,
  AgentDetailDto,
  AgentListResponseDto,
  AgentLogosResponseDto,
  AgentPanelDto,
  AgentStatus,
  AgentTrenchDetailResponseDto,
  AgentTrenchListResponseDto,
  AgentWithdrawDto,
  AgentWithdrawResponseDto,
  AvatarUploadResponseDto,
  CreateAgentDto,
  PromptTemplateResponseDto,
  TransactionListResponseDto,
  TransactionType,
  UpdateAgentDto,
} from "@/types/api";

import { apiClient } from "./client";

/**
 * Agent API service
 */
export const agentApi = {
  /**
   * Get all agents for current user
   */
  getMyAgents: async (status?: AgentStatus): Promise<AgentListResponseDto> => {
    const response = await apiClient.get<AgentListResponseDto>("/api/agents", {
      params: status ? { status } : undefined,
    });

    return response.data;
  },

  /**
   * Get active agents for current user
   */
  getActiveAgents: async (): Promise<AgentListResponseDto> => {
    const response =
      await apiClient.get<AgentListResponseDto>("/api/agents/active");

    return response.data;
  },

  /**
   * Get agent by ID
   */
  getAgentById: async (id: string): Promise<AgentDetailDto> => {
    const response = await apiClient.get<AgentDetailDto>(`/api/agents/${id}`);

    return response.data;
  },

  /**
   * Create a new agent
   */
  createAgent: async (data: CreateAgentDto): Promise<AgentDetailDto> => {
    const response = await apiClient.post<AgentDetailDto>("/api/agents", data);

    return response.data;
  },

  /**
   * Update an agent
   */
  updateAgent: async (
    id: string,
    data: UpdateAgentDto,
  ): Promise<AgentDetailDto> => {
    const response = await apiClient.put<AgentDetailDto>(
      `/api/agents/${id}`,
      data,
    );

    return response.data;
  },

  /**
   * Delete an agent
   */
  deleteAgent: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/agents/${id}`);
  },

  /**
   * Get agent panel data
   */
  getAgentPanel: async (id: string): Promise<AgentPanelDto> => {
    const response = await apiClient.get<AgentPanelDto>(
      `/api/agents/${id}/panel`,
    );

    return response.data;
  },

  /**
   * Get agent panel data by user's turnkey address
   * Used to view other users' agent info in rankings
   */
  getAgentPanelByUserAddress: async (
    userAddress: string,
  ): Promise<AgentPanelDto> => {
    const response = await apiClient.get<AgentPanelDto>(
      "/api/agents/panel/by-address",
      {
        params: { userAddress },
      },
    );

    return response.data;
  },

  /**
   * Toggle agent status (ACTIVE <-> PAUSED)
   */
  toggleStatus: async (id: string): Promise<AgentPanelDto> => {
    const response = await apiClient.patch<AgentPanelDto>(
      `/api/agents/${id}/toggle`,
    );

    return response.data;
  },

  /**
   * Record a deposit to agent
   */
  deposit: async (
    id: string,
    data: AgentDepositDto,
  ): Promise<AgentPanelDto> => {
    const response = await apiClient.post<AgentPanelDto>(
      `/api/agents/${id}/deposit`,
      data,
    );

    return response.data;
  },

  /**
   * Request a withdrawal from agent
   */
  withdraw: async (
    id: string,
    data: AgentWithdrawDto,
  ): Promise<AgentWithdrawResponseDto> => {
    const response = await apiClient.post<AgentWithdrawResponseDto>(
      `/api/agents/withdraw`,
      data,
    );

    return response.data;
  },

  /**
   * Get agent's trench participation history
   */
  getAgentTrenches: async (
    id: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<AgentTrenchListResponseDto> => {
    const response = await apiClient.get<AgentTrenchListResponseDto>(
      `/api/agents/${id}/trenches`,
      {
        params,
      },
    );

    return response.data;
  },

  /**
   * Get agent's trench detail with transactions
   */
  getTrenchDetail: async (
    agentId: string,
    trenchId: number,
  ): Promise<AgentTrenchDetailResponseDto> => {
    const response = await apiClient.get<AgentTrenchDetailResponseDto>(
      `/api/agents/${agentId}/trenches/${trenchId}`,
    );

    return response.data;
  },

  /**
   * Get agent's transactions
   */
  getAgentTransactions: async (
    id: string,
    params?: {
      trenchId?: number;
      txType?: TransactionType;
      page?: number;
      limit?: number;
    },
  ): Promise<TransactionListResponseDto> => {
    const response = await apiClient.get<TransactionListResponseDto>(
      `/api/agents/${id}/transactions`,
      { params },
    );

    return response.data;
  },

  /**
   * Get available agent logos
   */
  getAgentLogos: async (): Promise<AgentLogosResponseDto> => {
    const response =
      await apiClient.get<AgentLogosResponseDto>("/api/agents/logos");

    return response.data;
  },

  /**
   * Get the default prompt template for agents
   */
  getPromptTemplate: async (): Promise<PromptTemplateResponseDto> => {
    const response = await apiClient.get<PromptTemplateResponseDto>(
      "/api/agents/prompt-template",
    );

    return response.data;
  },

  /**
   * Upload a custom avatar image
   */
  uploadAvatar: async (file: File): Promise<AvatarUploadResponseDto> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<AvatarUploadResponseDto>(
      "/api/agents/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },
};
