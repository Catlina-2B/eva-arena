import type { AgentThinkReasonEventDto } from "@/types/websocket";

import { useEffect, useRef, useState } from "react";

import { subscribeUser } from "@/services/websocket";

/**
 * 思考状态类型
 * - thinking: 正在思考中
 * - action: 决策执行交易
 * - inaction: 决策 HOLD
 * - idle: 空闲状态
 */
export type ThinkingStatus = "thinking" | "action" | "inaction" | "idle";

/**
 * Hook for subscribing to real-time agent thinking events via WebSocket
 *
 * @param turnkeyAddress - User's turnkey address for subscription
 * @returns Current thinking status and latest think reason data
 */
export function useAgentThinkReason(turnkeyAddress: string | undefined) {
  const [status, setStatus] = useState<ThinkingStatus>("idle");
  const [latestEvent, setLatestEvent] =
    useState<AgentThinkReasonEventDto | null>(null);

  // Track if we should auto-reset status
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!turnkeyAddress) {
      setStatus("idle");
      return;
    }

    const unsubscribe = subscribeUser(turnkeyAddress, {
      onAgentThinkReason: (data) => {
        console.log("[useAgentThinkReason] Received event:", data.status);

        // Clear any pending reset timeout
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
          resetTimeoutRef.current = null;
        }

        // Update status based on event
        setStatus(data.status);
        setLatestEvent(data);

        // For action/inaction, auto-reset to idle after some time
        // to show the latest decision briefly
        if (data.status === "action" || data.status === "inaction") {
          resetTimeoutRef.current = setTimeout(() => {
            setStatus("idle");
          }, 10000); // Keep showing for 10 seconds
        }
      },
      onError: (error) => {
        console.error("[useAgentThinkReason] Error:", error);
      },
    });

    return () => {
      unsubscribe();
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [turnkeyAddress]);

  return {
    /** Current thinking status */
    status,
    /** Latest think reason event data */
    latestEvent,
    /** Whether agent is currently thinking */
    isThinking: status === "thinking",
    /** Whether there's a recent action/inaction decision */
    hasRecentDecision: status === "action" || status === "inaction",
  };
}
