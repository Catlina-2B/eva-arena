import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { manualTradeApi } from "@/services/api/manual-trade";

export function useManualPosition() {
  return useQuery({
    queryKey: ["manual-trade", "position"],
    queryFn: () => manualTradeApi.getPosition(),
    refetchInterval: 5000,
  });
}

export function useManualBalance() {
  return useQuery({
    queryKey: ["manual-trade", "balance"],
    queryFn: () => manualTradeApi.getBalance(),
    refetchInterval: 10000,
  });
}

export function useManualHistory(params?: {
  page?: number;
  limit?: number;
  txType?: string;
}) {
  return useQuery({
    queryKey: ["manual-trade", "history", params],
    queryFn: () => manualTradeApi.getHistory(params),
  });
}

export function useManualDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => manualTradeApi.deposit(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-trade"] });
      queryClient.invalidateQueries({ queryKey: ["trench"] });
    },
  });
}

export function useManualWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => manualTradeApi.withdraw(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-trade"] });
      queryClient.invalidateQueries({ queryKey: ["trench"] });
    },
  });
}

export function useManualBuy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      amount,
      slippageBps,
    }: {
      amount: number;
      slippageBps?: number;
    }) => manualTradeApi.buy(amount, slippageBps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-trade"] });
      queryClient.invalidateQueries({ queryKey: ["trench"] });
    },
  });
}

export function useManualSell() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: string) => manualTradeApi.sell(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-trade"] });
      queryClient.invalidateQueries({ queryKey: ["trench"] });
    },
  });
}

export function useExportStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recentTrenches?: number) =>
      manualTradeApi.exportStrategy(recentTrenches),
  });
}
