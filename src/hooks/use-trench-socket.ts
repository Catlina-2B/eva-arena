import type {
  LeaderboardUpdateEventDto,
  PriceUpdateEventDto,
  TransactionEventDto,
  TrenchUpdateEventDto,
} from "@/types/websocket";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { trenchKeys } from "./use-trenches";

import {
  ConnectionStatus,
  subscribeTrench,
  trenchSocketClient,
} from "@/services/websocket";

/**
 * Options for useTrenchSocket hook
 */
export interface UseTrenchSocketOptions {
  /** Called when trench state updates */
  onTrenchUpdate?: (data: TrenchUpdateEventDto) => void;
  /** Called when price updates */
  onPriceUpdate?: (data: PriceUpdateEventDto) => void;
  /** Called when a new transaction occurs */
  onTransaction?: (data: TransactionEventDto) => void;
  /** Called when leaderboard updates */
  onLeaderboardUpdate?: (data: LeaderboardUpdateEventDto) => void;
  /** Whether to automatically invalidate React Query cache on updates */
  autoInvalidate?: boolean;
  /** Database trench ID for query invalidation (required if autoInvalidate is true) */
  dbTrenchId?: number;
}

/**
 * Hook for subscribing to real-time trench updates via WebSocket
 *
 * @param trenchId - On-chain trench ID (string) for WebSocket subscription
 * @param options - Hook options including callbacks and query invalidation settings
 */
export function useTrenchSocket(
  trenchId: string | null | undefined,
  options: UseTrenchSocketOptions = {},
) {
  const {
    onTrenchUpdate,
    onPriceUpdate,
    onTransaction,
    onLeaderboardUpdate,
    autoInvalidate = true,
    dbTrenchId,
  } = options;

  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [latestPrice, setLatestPrice] = useState<PriceUpdateEventDto | null>(
    null,
  );
  const [latestTransaction, setLatestTransaction] =
    useState<TransactionEventDto | null>(null);
  const [transactions, setTransactions] = useState<TransactionEventDto[]>([]);

  // Keep track of handlers to avoid stale closures
  const handlersRef = useRef({
    onTrenchUpdate,
    onPriceUpdate,
    onTransaction,
    onLeaderboardUpdate,
  });

  handlersRef.current = {
    onTrenchUpdate,
    onPriceUpdate,
    onTransaction,
    onLeaderboardUpdate,
  };

  // Subscribe to connection status
  useEffect(() => {
    const unsubscribe = trenchSocketClient.onStatusChange(setConnectionStatus);

    return unsubscribe;
  }, []);

  // Subscribe to trench events
  useEffect(() => {
    if (!trenchId) return;

    const unsubscribe = subscribeTrench(trenchId, {
      onTrenchUpdate: (data) => {
        handlersRef.current.onTrenchUpdate?.(data);

        if (autoInvalidate && dbTrenchId) {
          queryClient.invalidateQueries({
            queryKey: trenchKeys.detail(dbTrenchId),
          });
          queryClient.invalidateQueries({ queryKey: trenchKeys.current() });
        }
      },

      onPriceUpdate: (data) => {
        setLatestPrice(data);
        handlersRef.current.onPriceUpdate?.(data);

        if (autoInvalidate && dbTrenchId) {
          queryClient.invalidateQueries({
            queryKey: trenchKeys.priceCurve(dbTrenchId),
          });
        }
      },

      onTransaction: (data) => {
        setLatestTransaction(data);
        setTransactions((prev) => [data, ...prev.slice(0, 49)]); // Keep last 50
        handlersRef.current.onTransaction?.(data);

        if (autoInvalidate && dbTrenchId) {
          queryClient.invalidateQueries({
            queryKey: trenchKeys.transactions(dbTrenchId),
          });
        }
      },

      onLeaderboardUpdate: (data) => {
        handlersRef.current.onLeaderboardUpdate?.(data);

        if (autoInvalidate && dbTrenchId) {
          queryClient.invalidateQueries({
            queryKey: trenchKeys.leaderboard(dbTrenchId),
          });
        }
      },

      onError: (error) => {
        console.error("[TrenchSocket] Error:", error);
      },
    });

    return () => {
      unsubscribe();
      setTransactions([]);
      setLatestPrice(null);
      setLatestTransaction(null);
    };
  }, [trenchId, autoInvalidate, dbTrenchId, queryClient]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    trenchSocketClient.disconnect();
    trenchSocketClient.connect();
  }, []);

  return {
    /** Current WebSocket connection status */
    connectionStatus,
    /** Whether WebSocket is connected */
    isConnected: connectionStatus === "connected",
    /** Latest price update */
    latestPrice,
    /** Latest transaction */
    latestTransaction,
    /** Recent transactions (up to 50) */
    transactions,
    /** Manually reconnect to WebSocket */
    reconnect,
  };
}

/**
 * Hook for just getting WebSocket connection status
 */
export function useSocketStatus() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    const unsubscribe = trenchSocketClient.onStatusChange(setStatus);

    return unsubscribe;
  }, []);

  return status;
}
