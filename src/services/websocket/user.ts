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

  // Set up event listeners — backend pushes data directly, no WsMessage wrapping
  const handleAgentThinkReason = (data: AgentThinkReasonEventDto) => {
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

  // Subscribe now if connected, and re-subscribe on every (re)connect
  if (socket.connected) {
    doSubscribe();
  }
  socket.on("connect", doSubscribe);

  // Return cleanup function
  return () => {
    if (socket.connected) {
      socket.emit(WsEventType.UNSUBSCRIBE_USER, { turnkeyAddress });
    }

    socket.off(WsEventType.AGENT_THINK_REASON, handleAgentThinkReason);
    socket.off(WsEventType.ERROR, handleError);
    socket.off("connect", doSubscribe);
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
