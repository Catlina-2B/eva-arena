import type {
  LeaderboardUpdateEventDto,
  PriceUpdateEventDto,
  SubscribeTrenchResponse,
  TransactionEventDto,
  TrenchUpdateEventDto,
  WsErrorEventDto,
  WsMessage,
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
 */
export function subscribeTrench(
  trenchId: number,
  handlers: TrenchEventHandlers,
): () => void {
  const socket = trenchSocketClient.getSocket();

  // Connect if not connected
  if (!socket.connected) {
    trenchSocketClient.connect();
  }

  // Set up event listeners
  const handleTrenchUpdate = (msg: WsMessage<TrenchUpdateEventDto>) => {
    handlers.onTrenchUpdate?.(msg.data);
  };

  const handlePriceUpdate = (msg: WsMessage<PriceUpdateEventDto>) => {
    handlers.onPriceUpdate?.(msg.data);
  };

  const handleTransaction = (msg: WsMessage<TransactionEventDto>) => {
    handlers.onTransaction?.(msg.data);
  };

  const handleLeaderboardUpdate = (
    msg: WsMessage<LeaderboardUpdateEventDto>,
  ) => {
    handlers.onLeaderboardUpdate?.(msg.data);
  };

  const handleError = (msg: WsMessage<WsErrorEventDto>) => {
    handlers.onError?.(msg.data);
  };

  // Register listeners
  socket.on(WsEventType.TRENCH_UPDATE, handleTrenchUpdate);
  socket.on(WsEventType.PRICE_UPDATE, handlePriceUpdate);
  socket.on(WsEventType.TRANSACTION, handleTransaction);
  socket.on(WsEventType.LEADERBOARD_UPDATE, handleLeaderboardUpdate);
  socket.on(WsEventType.ERROR, handleError);

  // Subscribe to trench after connection
  const doSubscribe = () => {
    socket.emit(
      WsEventType.SUBSCRIBE_TRENCH,
      { trenchId },
      (response: SubscribeTrenchResponse) => {
        if (response?.success) {
          console.log(`[TrenchSocket] Subscribed to trench ${trenchId}`);
        } else {
          console.error(
            `[TrenchSocket] Failed to subscribe to trench ${trenchId}`,
          );
        }
      },
    );
  };

  // Subscribe now if connected, or wait for connection
  if (socket.connected) {
    doSubscribe();
  } else {
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
 */
export function unsubscribeTrench(trenchId: number): void {
  const socket = trenchSocketClient.getSocket();

  if (socket.connected) {
    socket.emit(WsEventType.UNSUBSCRIBE_TRENCH, { trenchId });
  }
}
