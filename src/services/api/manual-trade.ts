import { apiClient } from "./client";

export interface ManualTradeResponse {
  success: boolean;
  signature?: string;
  error?: string;
}

export interface ManualPosition {
  trenchId: number;
  onChainTrenchId: string;
  phase: string;
  depositedSol: string;
  tokenBalance: string;
  totalBuySol: string;
  totalSellSol: string;
  pnlSol: string;
  currentTokenPriceSol?: string;
  rank?: number;
}

export interface ManualBalance {
  balanceLamports: string;
  balanceSol: string;
  walletAddress: string;
}

export interface ManualHistoryItem {
  id: number;
  trenchId: number;
  txType: string;
  solAmount?: string;
  tokenAmount?: string;
  tokenPriceSol?: string;
  signature: string;
  createdAt: string;
}

export interface ManualHistoryResponse {
  transactions: ManualHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ExportStrategyResponse {
  bettingStrategyPrompt: string;
  tradingStrategyPrompt: string;
  stats: {
    totalTrades: number;
    totalTrenches: number;
    winRate: number;
    avgPnlSol: string;
    tradingPatterns: string[];
  };
}

export const manualTradeApi = {
  deposit: async (amount: number): Promise<ManualTradeResponse> => {
    const { data } = await apiClient.post("/api/manual-trade/deposit", {
      amount,
    });
    return data;
  },

  withdraw: async (amount: number): Promise<ManualTradeResponse> => {
    const { data } = await apiClient.post("/api/manual-trade/withdraw", {
      amount,
    });
    return data;
  },

  buy: async (
    amount: number,
    slippageBps?: number,
  ): Promise<ManualTradeResponse> => {
    const { data } = await apiClient.post("/api/manual-trade/buy", {
      amount,
      slippageBps,
    });
    return data;
  },

  sell: async (amount: string): Promise<ManualTradeResponse> => {
    const { data } = await apiClient.post("/api/manual-trade/sell", {
      amount,
    });
    return data;
  },

  getPosition: async (): Promise<ManualPosition | null> => {
    const { data } = await apiClient.get("/api/manual-trade/position");
    return data;
  },

  getBalance: async (): Promise<ManualBalance> => {
    const { data } = await apiClient.get("/api/manual-trade/balance");
    return data;
  },

  getHistory: async (params?: {
    page?: number;
    limit?: number;
    txType?: string;
  }): Promise<ManualHistoryResponse> => {
    const { data } = await apiClient.get("/api/manual-trade/history", {
      params,
    });
    return data;
  },

  exportStrategy: async (
    recentTrenches?: number,
  ): Promise<ExportStrategyResponse> => {
    const { data } = await apiClient.post(
      "/api/manual-trade/export-strategy",
      { recentTrenches },
    );
    return data;
  },
};
