import { useQuery } from "@tanstack/react-query";

import { getCurrentSlot } from "@/services/solana";

/**
 * Query key for Solana slot
 */
export const slotKeys = {
  current: ["solana", "slot"] as const,
};

/**
 * Hook for getting current Solana slot
 *
 * @param refetchInterval - How often to refetch the slot (default: 1 second)
 */
export function useSolanaSlot(refetchInterval = 1000) {
  return useQuery({
    queryKey: slotKeys.current,
    queryFn: getCurrentSlot,
    // Slot changes every ~400ms, but we don't need to be that aggressive
    staleTime: 500,
    refetchInterval,
  });
}

/**
 * Calculate block progress within a trench
 *
 * @param currentSlot - Current Solana slot
 * @param startBlock - Trench start block (biddingStartBlock)
 * @param totalBlocks - Total blocks in the trench
 */
export function calculateBlockProgress(
  currentSlot: number,
  startBlock: number,
  totalBlocks: number,
): { currentBlock: number; progress: number } {
  const currentBlock = Math.max(0, currentSlot - startBlock);
  const cappedBlock = Math.min(currentBlock, totalBlocks);
  const progress = Math.min((cappedBlock / totalBlocks) * 100, 100);

  return { currentBlock: cappedBlock, progress };
}
