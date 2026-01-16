import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/auth";
import {
  walletApi,
  GetTransactionsQueryDto,
} from "@/services/api/wallet";

/**
 * Query keys for wallet
 */
export const walletKeys = {
  all: ["wallet"] as const,
  transactions: (params?: GetTransactionsQueryDto) =>
    [...walletKeys.all, "transactions", params] as const,
};

/**
 * Hook for getting wallet transactions (deposits/withdrawals)
 * 获取钱包交易记录
 */
export function useWalletTransactions(params?: GetTransactionsQueryDto) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: walletKeys.transactions(params),
    queryFn: () => walletApi.getTransactions(params),
    enabled: isAuthenticated,
  });
}
