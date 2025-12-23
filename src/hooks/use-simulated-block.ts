import { useEffect, useRef, useState } from "react";

/**
 * Solana slot interval in milliseconds (~400ms per slot)
 */
const SLOT_INTERVAL_MS = 400;

/**
 * Hook that simulates block increment based on Solana's ~400ms slot time.
 *
 * - Starts from the server-provided currentBlock
 * - Increments every 400ms to simulate real-time block progression
 * - Syncs to real value when server data updates
 *
 * @param serverBlock - The current block from server/API
 * @param maxBlock - Maximum block number (to cap the simulated value)
 */
export function useSimulatedBlock(serverBlock: number, maxBlock: number) {
  const [simulatedBlock, setSimulatedBlock] = useState(serverBlock);
  const lastServerBlockRef = useRef(serverBlock);
  const lastUpdateTimeRef = useRef(Date.now());

  // Sync to server value when it changes
  useEffect(() => {
    if (serverBlock !== lastServerBlockRef.current) {
      setSimulatedBlock(serverBlock);
      lastServerBlockRef.current = serverBlock;
      lastUpdateTimeRef.current = Date.now();
    }
  }, [serverBlock]);

  // Simulate block increment every 400ms
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedBlock((current) => {
        // Don't exceed max block
        if (current >= maxBlock) {
          return maxBlock;
        }

        return current + 1;
      });
    }, SLOT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [maxBlock]);

  return simulatedBlock;
}
