import { useEffect, useCallback } from "react";

import { getBalance, subscribeBalance } from "@/services/solana";
import { useTurnkeyBalanceStore } from "@/stores/turnkey-balance";

/**
 * Hook 用于订阅 Turnkey 钱包余额实时更新
 *
 * 使用 Solana RPC WebSocket 订阅账户余额变化，
 * 余额存储在全局 store 中，确保所有组件使用一致的数据
 *
 * @param turnkeyAddress Turnkey 钱包地址
 */
export function useTurnkeyBalance(turnkeyAddress: string | undefined) {
  const { balance, isLoading, error, setBalance, setLoading, setError, reset } =
    useTurnkeyBalanceStore();

  // 获取初始余额
  const fetchInitialBalance = useCallback(async () => {
    if (!turnkeyAddress) return;

    try {
      setLoading(true);
      const bal = await getBalance(turnkeyAddress);

      setBalance(bal);
    } catch (err) {
      console.error("[TurnkeyBalance] Failed to fetch initial balance:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  }, [turnkeyAddress, setBalance, setLoading, setError]);

  // 订阅余额变化
  useEffect(() => {
    if (!turnkeyAddress) {
      reset();

      return;
    }

    // 1. 获取初始余额
    fetchInitialBalance();

    // 2. 订阅余额变化
    const unsubscribe = subscribeBalance(turnkeyAddress, (newBalance) => {
      console.log("[TurnkeyBalance] Balance updated:", newBalance);
      setBalance(newBalance);
    });

    // 清理：取消订阅
    return () => {
      unsubscribe();
    };
  }, [turnkeyAddress, fetchInitialBalance, setBalance, reset]);

  return {
    /** SOL 余额 */
    balance,
    /** 是否正在加载 */
    isLoading,
    /** 错误信息 */
    error,
    /** Turnkey 钱包地址 */
    turnkeyAddress,
    /** 手动刷新余额 */
    refetch: fetchInitialBalance,
  };
}

