import type {
  LeaderboardUpdateEventDto,
  PriceUpdateEventDto,
  SubscribeTrenchResponse,
  TransactionEventDto,
  TrenchUpdateEventDto,
  WsErrorEventDto,
} from "@/types/websocket";

import { trenchSocketClient } from "./client";

import { WsEventType } from "@/types/websocket";

/**
 * Event handlers type
 */
export interface TrenchEventHandlers {
  onTrenchUpdate?: (data: TrenchUpdateEventDto) => void;
  onPriceUpdate?: (data: PriceUpdateEventDto) => void;
  onTransaction?: (data: TransactionEventDto) => void;
  onLeaderboardUpdate?: (data: LeaderboardUpdateEventDto) => void;
  onError?: (data: WsErrorEventDto) => void;
}

/**
 * Subscribe to a trench for real-time updates
 *
 * @param trenchId - On-chain trench ID (number) for subscription
 * @param handlers - Event handlers for various trench events
 */
export function subscribeTrench(
  trenchId: number,
  handlers: TrenchEventHandlers,
): () => void {
  console.log(`[TrenchSocket] subscribeTrench called with trenchId: ${trenchId}`);
  const socket = trenchSocketClient.getSocket();

  // Connect if not connected
  if (!socket.connected) {
    console.log("[TrenchSocket] Socket not connected, connecting...");
    trenchSocketClient.connect();
  } else {
    console.log("[TrenchSocket] Socket already connected");
  }

  // Set up event listeners - 后端直接推送数据，无 WsMessage 包装
  const handleTrenchUpdate = (data: TrenchUpdateEventDto) => {
    handlers.onTrenchUpdate?.(data);
  };

  const handlePriceUpdate = (data: PriceUpdateEventDto) => {
    handlers.onPriceUpdate?.(data);
  };

  const handleTransaction = (data: TransactionEventDto) => {
    handlers.onTransaction?.(data);
  };

  const handleLeaderboardUpdate = (data: LeaderboardUpdateEventDto) => {
    handlers.onLeaderboardUpdate?.(data);
  };

  const handleError = (data: WsErrorEventDto) => {
    handlers.onError?.(data);
  };

  // Register listeners
  socket.on(WsEventType.TRENCH_UPDATE, handleTrenchUpdate);
  socket.on(WsEventType.PRICE_UPDATE, handlePriceUpdate);
  socket.on(WsEventType.TRANSACTION, handleTransaction);
  socket.on(WsEventType.LEADERBOARD_UPDATE, handleLeaderboardUpdate);
  socket.on(WsEventType.ERROR, handleError);

  // Subscribe to trench after connection
  const doSubscribe = () => {
    console.log(`[TrenchSocket] Emitting subscribeTrench for trenchId: ${trenchId}`);
    socket.emit(
      WsEventType.SUBSCRIBE_TRENCH,
      { trenchId },
      (response: SubscribeTrenchResponse) => {
        if (response?.success) {
          console.log(`[TrenchSocket] Subscribed to trench ${trenchId}`, response);
        } else {
          console.error(
            `[TrenchSocket] Failed to subscribe to trench ${trenchId}`,
            response,
          );
        }
      },
    );
  };

  // Subscribe now if connected, or wait for connection
  if (socket.connected) {
    console.log("[TrenchSocket] Socket connected, subscribing immediately");
    doSubscribe();
  } else {
    console.log("[TrenchSocket] Socket not connected yet, waiting for connect event");
    socket.once("connect", doSubscribe);
  }

  // Return cleanup function
  return () => {
    // Unsubscribe from trench
    if (socket.connected) {
      socket.emit(WsEventType.UNSUBSCRIBE_TRENCH, { trenchId });
    }

    // Remove listeners
    socket.off(WsEventType.TRENCH_UPDATE, handleTrenchUpdate);
    socket.off(WsEventType.PRICE_UPDATE, handlePriceUpdate);
    socket.off(WsEventType.TRANSACTION, handleTransaction);
    socket.off(WsEventType.LEADERBOARD_UPDATE, handleLeaderboardUpdate);
    socket.off(WsEventType.ERROR, handleError);
  };
}

/**
 * Unsubscribe from a trench
 *
 * @param trenchId - On-chain trench ID (number)
 */
export function unsubscribeTrench(trenchId: number): void {
  const socket = trenchSocketClient.getSocket();

  if (socket.connected) {
    socket.emit(WsEventType.UNSUBSCRIBE_TRENCH, { trenchId });
  }
}
