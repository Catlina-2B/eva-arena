import { useEffect, useState, useCallback } from "react";

import { getSolanaConnection, getCurrentSlot } from "@/services/solana";
import { usePageVisibility } from "./use-page-visibility";

/**
 * Hook that subscribes to Solana slot updates via WebSocket.
 *
 * Uses `slotSubscribe` for real-time slot updates instead of polling.
 * Falls back to initial slot fetch if subscription fails.
 */
export function useSlotSubscription() {
  const [slot, setSlot] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isVisible } = usePageVisibility();

  // Fetch initial slot
  const fetchInitialSlot = useCallback(async () => {
    try {
      const currentSlot = await getCurrentSlot();

      setSlot(currentSlot);

      return currentSlot;
    } catch (err) {
      console.error("Failed to fetch initial slot:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch slot"));

      return null;
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let subscriptionId: number | null = null;
    let mounted = true;

    const setupSubscription = async () => {
      await fetchInitialSlot();

      if (!mounted) return;

      try {
        const connection = getSolanaConnection();

        subscriptionId = connection.onSlotChange((slotInfo) => {
          if (mounted) {
            setSlot(slotInfo.slot);
            setIsConnected(true);
            setError(null);
          }
        });

        setIsConnected(true);
      } catch (err) {
        console.error("Failed to subscribe to slot updates:", err);
        setError(err instanceof Error ? err : new Error("Subscription failed"));
        setIsConnected(false);
      }
    };

    setupSubscription();

    return () => {
      mounted = false;
      if (subscriptionId !== null) {
        const connection = getSolanaConnection();

        connection
          .removeSlotChangeListener(subscriptionId)
          .catch(console.error);
      }
    };
  }, [fetchInitialSlot, isVisible]);

  return {
    slot,
    isConnected,
    error,
  };
}
