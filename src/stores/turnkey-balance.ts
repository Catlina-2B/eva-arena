import { create } from "zustand";

/**
 * Turnkey 钱包余额全局状态
 */
interface TurnkeyBalanceState {
  /** SOL 余额 (已从 lamports 转换) */
  balance: number;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 最后更新时间戳 */
  lastUpdated: number | null;
  /** Solana RPC 订阅 ID */
  subscriptionId: number | null;

  // Actions
  setBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSubscriptionId: (id: number | null) => void;
  reset: () => void;
}

/**
 * Turnkey 余额 store
 */
export const useTurnkeyBalanceStore = create<TurnkeyBalanceState>((set) => ({
  balance: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
  subscriptionId: null,

  setBalance: (balance) =>
    set({
      balance,
      lastUpdated: Date.now(),
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  setSubscriptionId: (subscriptionId) => set({ subscriptionId }),

  reset: () =>
    set({
      balance: 0,
      isLoading: false,
      error: null,
      lastUpdated: null,
      subscriptionId: null,
    }),
}));

