import { useQuery } from "@tanstack/react-query";

import { priceApi } from "@/services/api";

/**
 * Query keys for price
 */
export const priceKeys = {
  sol: ["price", "sol"] as const,
};

/**
 * Hook for getting SOL price
 */
export function useSolPrice() {
  return useQuery({
    queryKey: priceKeys.sol,
    queryFn: () => priceApi.getSolPrice(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for getting SOL price as a number
 */
export function useSolPriceValue() {
  const { data, ...rest } = useSolPrice();

  return {
    ...rest,
    data: data ? parseFloat(data.price) : undefined,
  };
}
