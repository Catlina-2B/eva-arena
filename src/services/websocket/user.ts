import type {
  AgentThinkReasonEventDto,
  SubscribeUserResponse,
  WsErrorEventDto,
} from "@/types/websocket";

import { trenchSocketClient } from "./client";
import { WsEventType } from "@/types/websocket";

/**
 * User event handlers type
 */
export interface UserEventHandlers {
  onAgentThinkReason?: (data: AgentThinkReasonEventDto) => void;
  onError?: (data: WsErrorEventDto) => void;
}

/**
 * Subscribe to user room for real-time agent thinking events
 *
 * @param turnkeyAddress - User's turnkey address for subscription
 * @param handlers - Event handlers for agent events
 */
export function subscribeUser(
  turnkeyAddress: string,
  handlers: UserEventHandlers,
): () => void {
  console.log(
    `[UserSocket] subscribeUser called with address: ${turnkeyAddress.slice(0, 8)}...`,
  );
  const socket = trenchSocketClient.getSocket();

  // Connect if not connected
  if (!socket.connected) {
    console.log("[UserSocket] Socket not connected, connecting...");
    trenchSocketClient.connect();
  }

  // Set up event listeners
  // Event format: { event: "agentThinkReason", data: {...}, timestamp: number }
  const handleAgentThinkReason = (msg: { event: string; data: AgentThinkReasonEventDto; timestamp: number }) => {
    const data = msg.data;
    console.log("[UserSocket] agentThinkReason received:", data.status, data);
    handlers.onAgentThinkReason?.(data);
  };

  const handleError = (data: WsErrorEventDto) => {
    handlers.onError?.(data);
  };

  // Register listeners
  socket.on(WsEventType.AGENT_THINK_REASON, handleAgentThinkReason);
  socket.on(WsEventType.ERROR, handleError);

  // Subscribe to user room after connection
  const doSubscribe = () => {
    console.log(
      `[UserSocket] Emitting subscribeUser for address: ${turnkeyAddress.slice(0, 8)}...`,
    );
    socket.emit(
      WsEventType.SUBSCRIBE_USER,
      { turnkeyAddress },
      (response: SubscribeUserResponse) => {
        if (response?.success) {
          console.log(
            `[UserSocket] Subscribed to user room: ${response.room}`,
            response,
          );
        } else {
          console.error(
            `[UserSocket] Failed to subscribe to user room`,
            response,
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
    // Unsubscribe from user room
    if (socket.connected) {
      socket.emit(WsEventType.UNSUBSCRIBE_USER, { turnkeyAddress });
    }

    // Remove listeners
    socket.off(WsEventType.AGENT_THINK_REASON, handleAgentThinkReason);
    socket.off(WsEventType.ERROR, handleError);
  };
}

/**
 * Unsubscribe from user room
 */
export function unsubscribeUser(turnkeyAddress: string): void {
  const socket = trenchSocketClient.getSocket();

  if (socket.connected) {
    socket.emit(WsEventType.UNSUBSCRIBE_USER, { turnkeyAddress });
  }
}
