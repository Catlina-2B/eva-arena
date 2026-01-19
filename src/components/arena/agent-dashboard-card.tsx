import type { Agent, ActivityItem } from "@/types";
import type { TransactionDto, TransactionType } from "@/types/api";

import clsx from "clsx";
import { useMemo, useState } from "react";

import { EvaCard, EvaCardContent, EvaBadge, EvaButton } from "@/components/ui";
import { useUserTransactions, useLatestThinkReason, useAgentThinkReason } from "@/hooks";
import { ReasoningModal } from "./reasoning-modal";

// Execution log entry type
export interface ExecutionLogEntry {
  id: string;
  txType: TransactionType;
  action: string;
  amount: number;
  userAddress: string;
  trenchId: number;
}

interface AgentDashboardCardProps {
  agent: Agent;
  tokenBalance: number;
  tokenChangePercent: number;
  solBalance: number;
  totalPnl: number;
  roundPnl: number;
  /** Current trench ID for fetching user transactions */
  trenchId?: number;
  /** Agent's turnkey address for filtering transactions */
  turnkeyAddress?: string;
  /** Whether the toggle operation is in progress */
  isToggling?: boolean;
  onStartSystem?: () => void;
  onPauseSystem?: () => void;
  /** @deprecated Use onEvolveMe instead */
  onEditName?: () => void;
  /** Callback when EVOLVE ME button is clicked */
  onEvolveMe?: () => void;
}

// Convert transaction type to display action
function txTypeToAction(txType: TransactionType): string {
  switch (txType) {
    case "BUY":
      return "BUY";
    case "SELL":
      return "SELL";
    case "DEPOSIT":
      return "DEPOSIT";
    case "WITHDRAW":
      return "WITHDRAW";
    case "PRIZE":
      return "Reward";
    default:
      return txType;
  }
}

// Convert TransactionDto to ExecutionLogEntry
function transactionToLogEntry(tx: TransactionDto): ExecutionLogEntry {
  const solAmount = tx.solAmount ? parseFloat(tx.solAmount) / 1e9 : 0;

  return {
    id: tx.signature,
    txType: tx.txType,
    action: txTypeToAction(tx.txType),
    amount: solAmount,
    userAddress: tx.userAddress,
    trenchId: tx.trenchId,
  };
}

// Transaction type badge component - matches Figma design with gray background
function TxTypeBadge({ txType }: { txType: TransactionType }) {
  // Get display text for transaction type
  const getDisplayText = () => {
    switch (txType) {
      case "BUY":
        return "Trading Phase";
      case "SELL":
        return "Trading Phase";
      case "DEPOSIT":
        return "Betting Phase";
      case "WITHDRAW":
        return "Betting Phase";
      case "PRIZE":
        return "Liquidation";
      default:
        return txType;
    }
  };

  return (
    <span className="inline-flex items-center px-1 py-0.5 text-[10px] rounded bg-[#1f2937] text-eva-text-dim font-medium">
      {getDisplayText()}
    </span>
  );
}

// Edit icon component
function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("w-4 h-4", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}

// Play icon component
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("w-5 h-5", className)}
      fill="none"
      viewBox="0 0 21 20"
    >
      <path 
        d="M16.1466 10.3468L7.31442 16.2349C7.12295 16.3625 6.86425 16.3108 6.7366 16.1194C6.69098 16.0509 6.66663 15.9705 6.66663 15.8882V4.11198C6.66663 3.88185 6.85318 3.69531 7.08329 3.69531C7.16555 3.69531 7.24598 3.71966 7.31442 3.76529L16.1466 9.65337C16.338 9.78104 16.3898 10.0398 16.2621 10.2312C16.2316 10.277 16.1924 10.3163 16.1466 10.3468Z" 
        fill="#D357E0"
      />
    </svg>
  );
}

// Pause icon component
function PauseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("w-5 h-5", className)}
      fill="none"
      viewBox="0 0 21 20"
    >
      <path 
        d="M6.66689 4.1665H8.88905L8.88884 15.8332H6.66669L6.66689 4.1665ZM11.1112 4.1665H13.3334L13.3331 15.8332H11.111L11.1112 4.1665Z" 
        fill="#6CE182"
      />
    </svg>
  );
}

// Hourglass icon component for waiting state
function HourglassIcon({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("w-5 h-5", className)}
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        d="M5.83337 2.5H14.1667V5.83333C14.1667 7.67428 12.6743 9.16667 10.8334 9.16667H9.16671C7.32576 9.16667 5.83337 7.67428 5.83337 5.83333V2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.83337 17.5H14.1667V14.1667C14.1667 12.3257 12.6743 10.8333 10.8334 10.8333H9.16671C7.32576 10.8333 5.83337 12.3257 5.83337 14.1667V17.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.16663 2.5H15.8333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4.16663 17.5H15.8333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Default agent avatar with EVA-style geometric design
function AgentAvatar({ avatar, name }: { avatar?: string; name: string }) {
  if (avatar) {
    return (
      <img
        alt={name}
        className="w-14 h-14 rounded-lg object-cover border border-eva-border"
        src={avatar}
      />
    );
  }

  // Default EVA-style avatar with abstract purple pattern
  return (
    <div className="w-14 h-14 rounded-lg border border-eva-border bg-eva-dark overflow-hidden flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 56 56">
        <defs>
          <linearGradient
            id="eva-avatar-bg"
            x1="0%"
            x2="100%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#1a1a25" />
            <stop offset="100%" stopColor="#0a0a0f" />
          </linearGradient>
          <linearGradient
            id="eva-avatar-accent"
            x1="0%"
            x2="100%"
            y1="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
        <rect fill="url(#eva-avatar-bg)" height="56" width="56" />
        {/* Abstract EVA-style geometric pattern */}
        <polygon
          fill="none"
          opacity="0.6"
          points="28,8 44,28 28,48 12,28"
          stroke="#a855f7"
          strokeWidth="1.5"
        />
        <polygon
          fill="url(#eva-avatar-accent)"
          opacity="0.4"
          points="28,14 38,28 28,42 18,28"
        />
        <circle cx="28" cy="28" fill="#a855f7" opacity="0.8" r="6" />
        <circle cx="28" cy="28" fill="#e879f9" r="3" />
        {/* Decorative lines */}
        <line
          opacity="0.4"
          stroke="#c084fc"
          strokeWidth="1"
          x1="12"
          x2="20"
          y1="12"
          y2="20"
        />
        <line
          opacity="0.4"
          stroke="#c084fc"
          strokeWidth="1"
          x1="44"
          x2="36"
          y1="12"
          y2="20"
        />
        <line
          opacity="0.4"
          stroke="#c084fc"
          strokeWidth="1"
          x1="12"
          x2="20"
          y1="44"
          y2="36"
        />
        <line
          opacity="0.4"
          stroke="#c084fc"
          strokeWidth="1"
          x1="44"
          x2="36"
          y1="44"
          y2="36"
        />
      </svg>
    </div>
  );
}

// Arrow icon for EVOLVE ME button
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("w-4 h-4", className)}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M3 8h10M10 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Lightbulb icon for thinking
function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("w-4 h-4", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

export function AgentDashboardCard({
  agent,
  tokenBalance,
  tokenChangePercent,
  solBalance,
  totalPnl,
  roundPnl,
  trenchId,
  turnkeyAddress,
  isToggling = false,
  onStartSystem,
  onPauseSystem,
  onEditName,
  onEvolveMe,
}: AgentDashboardCardProps) {
  const isRunning = agent.status === "running";
  const isPaused = agent.status === "paused";
  const isWaiting = agent.status === "waiting";

  // State for reasoning modal
  const [isReasoningModalOpen, setIsReasoningModalOpen] = useState(false);

  // Fetch latest think reason from API (for historical data)
  const { data: latestThinkReason, isLoading: isThinkReasonLoading } = 
    useLatestThinkReason({ polling: true });

  // Subscribe to real-time thinking status via WebSocket
  const { status: thinkingStatus, latestEvent: wsThinkEvent } = 
    useAgentThinkReason(turnkeyAddress);

  // Fetch user's transactions for this trench using agent's turnkey address
  const { data: transactionsData, isLoading: isTransactionsLoading } =
    useUserTransactions(trenchId, { 
      userAddress: turnkeyAddress,
      limit: 10, 
      txType: ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAW', 'PRIZE'] 
    });

  // Convert think reason to ActivityItem for ReasoningModal
  // Prefer WebSocket event data if available with content, otherwise use API data
  const thinkReasonActivity: ActivityItem | null = useMemo(() => {
    // If WS event has content, use it
    if (wsThinkEvent?.content && wsThinkEvent.id) {
      return {
        id: String(wsThinkEvent.id),
        type: "buy" as const,
        agentId: "",
        agentName: agent.name,
        userAddress: wsThinkEvent.userAddress,
        tokenAmount: 0,
        solAmount: 0,
        timestamp: new Date(wsThinkEvent.createdAt || Date.now()),
        signature: "",
        reason: {
          id: wsThinkEvent.id,
          content: wsThinkEvent.content,
          action: wsThinkEvent.action || (wsThinkEvent.status === "action" ? "Execute Trade" : "Hold Position"),
          createdAt: wsThinkEvent.createdAt || new Date().toISOString(),
        },
      };
    }
    // Otherwise use API data
    if (latestThinkReason) {
      return {
        id: String(latestThinkReason.id),
        type: "buy" as const,
        agentId: "",
        agentName: agent.name,
        userAddress: latestThinkReason.userAddress,
        tokenAmount: 0,
        solAmount: 0,
        timestamp: new Date(latestThinkReason.createdAt),
        signature: "",
        reason: {
          id: latestThinkReason.id,
          content: latestThinkReason.content,
          action: latestThinkReason.action || (latestThinkReason.status === "ACTION" ? "Execute Trade" : "Hold Position"),
          createdAt: latestThinkReason.createdAt,
        },
      };
    }
    return null;
  }, [wsThinkEvent, latestThinkReason, agent.name]);

  // Convert transactions to execution log entries
  const executionLogs = useMemo(() => {
    if (!transactionsData?.transactions) return [];

    return transactionsData.transactions.map(transactionToLogEntry);
  }, [transactionsData]);

  // Format number with commas
  const formatNumber = (num: number | undefined | null) => {
    if (num == null) return "0.0000";

    return num.toLocaleString("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  };

  // Format token number with K, M, B units
  const formatTokenNumber = (num: number | undefined | null) => {
    if (num == null || num === 0) return "0";

    const absNum = Math.abs(num);
    const sign = num < 0 ? "-" : "";

    if (absNum >= 1_000_000_000) {
      return sign + (absNum / 1_000_000_000).toFixed(2) + "B";
    }
    if (absNum >= 1_000_000) {
      return sign + (absNum / 1_000_000).toFixed(2) + "M";
    }
    if (absNum >= 1_000) {
      return sign + (absNum / 1_000).toFixed(2) + "K";
    }

    return sign + absNum.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Format short address
  const formatShortAddress = (address: string) => {
    if (!address) return "";

    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <EvaCard className="relative">
      {/* Status Badge - Absolute positioned at top right corner */}
      <div className="absolute top-[-2px] right-[-1px] z-10">
        <EvaBadge
          variant={(isPaused || isWaiting) ? "warning" : isRunning ? "success" : "default"}
        >
          {(isPaused || isWaiting) ? "PAUSED" : isRunning ? "RUNNING" : "STOPPED"}
        </EvaBadge>
      </div>

      <EvaCardContent className="py-4">
        {/* Agent Header */}
        <div className="flex items-center gap-3 mb-4">
          <AgentAvatar avatar={agent.avatar} name={agent.name} />
          <div className="flex justify-between w-full">
            <span className="text-lg font-bold tracking-wide text-eva-text">
              {agent.name}
            </span>
            {/* EVOLVE ME Button - Green filled style */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6ce182] text-black text-xs font-semibold uppercase tracking-wider hover:bg-[#5bd174] transition-colors rounded-xs"
              onClick={onEvolveMe || onEditName}
            >
              EVOLVE ME
              <ArrowRightIcon className="text-black" />
            </button>
          </div>
        </div>

        {/* Balance Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Token Balance */}
          <div className="bg-eva-dark/50 border border-eva-border rounded-lg p-3">
            <div className="text-[10px] text-eva-text-dim uppercase tracking-wider mb-1">
              TOKEN BAL
            </div>
            <div className="font-mono text-xl font-semibold text-eva-text">
              {formatTokenNumber(tokenBalance)}
            </div>
            <div className="text-xs font-mono text-purple-400">
              {((tokenBalance / 1_000_000_000) * 100).toFixed(2)}%
            </div>
          </div>

          {/* SOL Balance */}
          <div className="bg-eva-dark/50 border border-eva-border rounded-lg p-3">
            <div className="text-[10px] text-eva-text-dim uppercase tracking-wider mb-1">
              SOL BAL
            </div>
            <div className="font-mono text-xl font-semibold text-eva-text">
              {formatNumber(solBalance)}
            </div>
          </div>
        </div>

        {/* PNL Stats */}
        <div className="space-y-2 py-3 border-y border-eva-border mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-eva-text-dim uppercase tracking-wider">
              TOTAL PNL
            </span>
            <span
              className={clsx(
                "font-mono text-sm font-semibold",
                totalPnl >= 0 ? "text-eva-primary" : "text-eva-danger",
              )}
            >
              {totalPnl >= 0 ? "+" : ""}
              {formatNumber(totalPnl)} SOL
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-eva-text-dim uppercase tracking-wider">
              ROUND PNL
            </span>
            <span
              className={clsx(
                "font-mono text-sm font-semibold",
                roundPnl >= 0 ? "text-eva-primary" : "text-eva-danger",
              )}
            >
              {roundPnl >= 0 ? "+" : ""}
              {formatNumber(roundPnl)} SOL
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={clsx(
            "w-full h-[44px] mb-4 text-sm font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3",
            isWaiting
              ? "text-white bg-[#4b5563] cursor-not-allowed"
              : isPaused 
                ? "text-black bg-[#D357E0] hover:bg-[#C045CF]"
                : "text-black bg-eva-primary hover:bg-eva-primary-dim"
          )}
          style={{
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)"
          }}
          disabled={isToggling || isWaiting}
          onClick={isPaused ? onStartSystem : onPauseSystem}
        >
          {isToggling ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              UPDATING...
            </>
          ) : isWaiting ? (
            <>
              <HourglassIcon />
              WAITING NEXT ROUND
            </>
          ) : isPaused ? (
            <>
              <div className="bg-black px-[1px] py-[1px]">
                <PlayIcon />
              </div>
              START
            </>
          ) : (
            <>
              <div className="bg-black px-[1px] py-[1px]">
                <PauseIcon />
              </div>
              PAUSE
            </>
          )}
        </button>

        {/* Execution Logs */}
        <div>
          <div className="text-[10px] text-eva-text-dim uppercase tracking-wider mb-2">
            EXECUTION LOGS
          </div>

          {/* Thinking Status - Show at top of execution logs */}
          <div className="mb-2">
            {thinkingStatus === "thinking" ? (
              <button
                className="w-full flex items-center justify-between p-2 bg-eva-dark/50 border border-eva-border rounded text-left"
                onClick={() => latestThinkReason && setIsReasoningModalOpen(true)}
              >
                <span className="text-sm text-eva-text">Thinking</span>
                <div className="w-4 h-4 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
              </button>
            ) : thinkingStatus === "inaction" ? (
              <button
                className="w-full flex items-center justify-between p-2 bg-eva-dark/50 border border-eva-border rounded hover:bg-eva-card-hover hover:border-eva-primary/50 transition-colors text-left"
                onClick={() => setIsReasoningModalOpen(true)}
              >
                <span className="text-sm text-eva-text">Inaction</span>
                <LightbulbIcon className="text-eva-text-dim" />
              </button>
            ) : thinkingStatus === "action" ? (
              <button
                className="w-full flex items-center justify-between p-2 bg-eva-dark/50 border border-eva-border rounded hover:bg-eva-card-hover hover:border-eva-primary/50 transition-colors text-left"
                onClick={() => setIsReasoningModalOpen(true)}
              >
                <span className="text-sm text-eva-text">Action</span>
                <LightbulbIcon className="text-eva-primary" />
              </button>
            ) : isThinkReasonLoading ? (
              <div className="flex items-center gap-2 p-2 bg-eva-dark/50 border border-eva-border rounded">
                <div className="w-3 h-3 border border-eva-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-eva-text-dim">Loading...</span>
              </div>
            ) : latestThinkReason ? (
              <button
                className="w-full flex items-center justify-between p-2 bg-eva-dark/50 border border-eva-border rounded hover:bg-eva-card-hover hover:border-eva-primary/50 transition-colors text-left"
                onClick={() => setIsReasoningModalOpen(true)}
              >
                <span className="text-sm text-eva-text">
                  {latestThinkReason.status === "ACTION" ? "Action" : "Inaction"}
                </span>
                <LightbulbIcon className={latestThinkReason.status === "ACTION" ? "text-eva-primary" : "text-eva-text-dim"} />
              </button>
            ) : null}
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {isTransactionsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-4 h-4 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : executionLogs.length === 0 ? (
              <div className="text-xs text-eva-text-dim text-center py-4">
                No transactions yet
              </div>
            ) : (
              executionLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-3 text-xs py-1"
                >
                  {/* Left: EVA Round Number */}
                  <span className="font-mono text-eva-text-dim text-[10px]">
                    Eva-{log.trenchId}
                  </span>
                  {/* Middle: Phase Badge */}
                  <div>
                    <TxTypeBadge txType={log.txType} />
                  </div>
                  {/* Right: Action + Amount */}
                  <span className="font-mono text-eva-text-dim text-[10px] justify-self-end">
                    {log.action} {log.amount.toFixed(4)} SOL
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reasoning Modal */}
        <ReasoningModal
          isOpen={isReasoningModalOpen}
          onClose={() => setIsReasoningModalOpen(false)}
          activity={thinkReasonActivity}
        />
      </EvaCardContent>
    </EvaCard>
  );
}
