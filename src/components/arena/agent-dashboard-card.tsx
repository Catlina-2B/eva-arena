import type { Agent, ActivityItem } from "@/types";
import type { TransactionDto, TransactionType } from "@/types/api";

import clsx from "clsx";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";

import { EvaCard, EvaCardContent, EvaBadge, EvaButton } from "@/components/ui";
import { useUserTransactions, useLatestThinkReason, useAgentThinkReason } from "@/hooks";
import { ReasoningModal } from "./reasoning-modal";

// Animated number component for PNL changes
function AnimatedNumber({
  value,
  formatFn,
  className,
  flashOnChange = true,
}: {
  value: number;
  formatFn: (n: number) => string;
  className?: string;
  flashOnChange?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      // Trigger flash animation
      if (flashOnChange) {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 600);
      }

      // Animate number change
      const startValue = prevValueRef.current;
      const endValue = value;
      const duration = 500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeProgress;
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
        }
      };

      requestAnimationFrame(animate);
      prevValueRef.current = value;
    }
  }, [value, flashOnChange]);

  return (
    <span
      className={clsx(
        className,
        "transition-all duration-300",
        isFlashing && (value >= 0 ? "animate-pulse text-eva-primary scale-105" : "animate-pulse text-eva-danger scale-105")
      )}
    >
      {formatFn(displayValue)}
    </span>
  );
}

// Thinking dots animation component
function ThinkingDots() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "." : prev + ".");
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return <span className="inline-block w-6 text-left">{dots}</span>;
}

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
  /** When true, removes outer card styling for embedding in tabs */
  embedded?: boolean;
  /** Agent's current rank in the leaderboard (1-based) */
  rank?: number;
  /** Token amount needed to reach top 3 (only relevant when rank > 3) */
  gapToTop3?: number;
  /** Total number of agents in the competition */
  totalAgents?: number;
  /** Rank change from previous (positive = improved, negative = dropped) */
  rankChange?: number;
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

// Chevron icon for accordion
function ChevronIcon({ className, isExpanded }: { className?: string; isExpanded: boolean }) {
  return (
    <svg
      className={clsx("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M19 9l-7 7-7-7"
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
  embedded = false,
  rank,
  gapToTop3,
  totalAgents,
  rankChange,
}: AgentDashboardCardProps) {
  const isRunning = agent.status === "running";
  const isPaused = agent.status === "paused";
  const isWaiting = agent.status === "waiting";

  // State for reasoning modal
  const [isReasoningModalOpen, setIsReasoningModalOpen] = useState(false);

  // State for reasoning accordion expansion
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  // State for new reasoning pulse animation
  const [isReasoningPulsing, setIsReasoningPulsing] = useState(false);

  // Track previous reasoning id to detect new reasoning
  const prevReasoningIdRef = useRef<number | null>(null);

  // Fetch latest think reason from API (for historical data)
  const { data: latestThinkReason, isLoading: isThinkReasonLoading } =
    useLatestThinkReason({ polling: true });

  // Subscribe to real-time thinking status via WebSocket
  const { status: thinkingStatus, latestEvent: wsThinkEvent } =
    useAgentThinkReason(turnkeyAddress);

  // Auto-expand and pulse when new reasoning arrives
  useEffect(() => {
    const currentId = wsThinkEvent?.id || latestThinkReason?.id || null;
    if (currentId && currentId !== prevReasoningIdRef.current) {
      setIsReasoningExpanded(true);
      // Trigger pulse animation
      setIsReasoningPulsing(true);
      setTimeout(() => setIsReasoningPulsing(false), 2000);
      prevReasoningIdRef.current = currentId;
    }
  }, [wsThinkEvent?.id, latestThinkReason?.id]);

  // Fetch user's transactions for this trench using agent's turnkey address
  const { data: transactionsData, isLoading: isTransactionsLoading } =
    useUserTransactions(trenchId, {
      userAddress: turnkeyAddress,
      limit: 10,
      txType: ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAW', 'PRIZE']
    });

  // Track new transactions for slide-in animation
  const [newTradeIds, setNewTradeIds] = useState<Set<string>>(new Set());
  const prevTradeIdsRef = useRef<Set<string>>(new Set());

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

  // Detect new transactions for slide-in animation
  useEffect(() => {
    if (executionLogs.length > 0) {
      const currentIds = new Set(executionLogs.map(log => log.id));
      const newIds = new Set<string>();

      currentIds.forEach(id => {
        if (!prevTradeIdsRef.current.has(id)) {
          newIds.add(id);
        }
      });

      if (newIds.size > 0) {
        setNewTradeIds(newIds);
        // Clear animation after delay
        setTimeout(() => setNewTradeIds(new Set()), 1500);
      }

      prevTradeIdsRef.current = currentIds;
    }
  }, [executionLogs]);

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

  const content = (
    <>
      {/* Status Badge - Absolute positioned at top right corner */}
      <div className={clsx("absolute z-10", embedded ? "top-2 right-2" : "top-[-2px] right-[-1px]")}>
        <EvaBadge
          variant={(isPaused || isWaiting) ? "warning" : isRunning ? "success" : "default"}
        >
          {(isPaused || isWaiting) ? "PAUSED" : isRunning ? "RUNNING" : "STOPPED"}
        </EvaBadge>
      </div>

      <div className={clsx(embedded ? "p-4" : "py-4")}>
        {/* Agent Header with Ranking */}
        <div className="flex items-center gap-3 mb-3">
          <AgentAvatar avatar={agent.avatar} name={agent.name} />
          <div className="flex-1 min-w-0">
            <span className="text-lg font-bold tracking-wide text-eva-text block truncate">
              {agent.name}
            </span>
            {/* Inline Ranking Info */}
            {rank !== undefined && (
              <div className="flex items-center gap-2 mt-0.5">
                {rank <= 3 ? (
                  <>
                    <span className={clsx(
                      "text-sm font-bold font-mono",
                      rank === 1 ? "text-yellow-400" :
                      rank === 2 ? "text-gray-300" :
                      "text-orange-400"
                    )}>
                      #{rank} {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                    </span>
                    {/* Rank change indicator */}
                    {rankChange !== undefined && rankChange !== 0 && (
                      <span className={clsx(
                        "text-[10px] font-mono font-semibold flex items-center gap-0.5",
                        rankChange > 0 ? "text-eva-success" : "text-eva-danger"
                      )}>
                        {rankChange > 0 ? "↑" : "↓"}{Math.abs(rankChange)}
                      </span>
                    )}
                    <span className="text-[10px] text-eva-text-dim">
                      Prize {rank === 1 ? "50%" : rank === 2 ? "30%" : "15%"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-mono text-eva-text-dim">
                      #{rank}
                    </span>
                    {/* Rank change indicator */}
                    {rankChange !== undefined && rankChange !== 0 && (
                      <span className={clsx(
                        "text-[10px] font-mono font-semibold flex items-center gap-0.5",
                        rankChange > 0 ? "text-eva-success" : "text-eva-danger"
                      )}>
                        {rankChange > 0 ? "↑" : "↓"}{Math.abs(rankChange)}
                      </span>
                    )}
                    {gapToTop3 !== undefined && gapToTop3 > 0 && (
                      <span className="text-[10px] text-eva-warning">
                        ↑ {formatTokenNumber(gapToTop3)} to Top 3
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Evolve CTA - Question-guided */}
        <div className="mb-4 p-3 bg-gradient-to-r from-eva-primary/5 to-transparent border border-eva-border rounded-lg">
          <p className="text-xs text-eva-text-dim mb-2">
            Want me to trade differently?
          </p>
          <button
            className="flex items-center gap-2 text-eva-primary hover:text-eva-primary-dim transition-colors group"
            onClick={onEvolveMe || onEditName}
          >
            <span className="text-sm font-medium">Teach Me</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Balance & PNL Stats - Compact Layout */}
        <div className="bg-eva-dark/50 border border-eva-border rounded-lg p-3 mb-4">
          {/* Balance Row */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-eva-border/50">
            <div className="flex items-center gap-1">
              <span className="font-mono text-lg font-semibold text-eva-text">
                {formatTokenNumber(tokenBalance)}
              </span>
              <span className="text-[10px] text-eva-text-dim uppercase">TOKEN</span>
              <span className="text-xs font-mono text-purple-400 ml-1">
                ({((tokenBalance / 1_000_000_000) * 100).toFixed(2)}%)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-lg font-semibold text-eva-text">
                {formatNumber(solBalance)}
              </span>
              <span className="text-[10px] text-eva-text-dim uppercase">SOL</span>
            </div>
          </div>

          {/* PNL Row */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-eva-text-dim uppercase tracking-wider mb-1">
                Total PNL
              </div>
              <div className={clsx(
                "font-mono text-xl font-semibold",
                totalPnl >= 0 ? "text-eva-primary" : "text-eva-danger",
              )}>
                {totalPnl >= 0 ? "+" : ""}
                <AnimatedNumber
                  value={totalPnl}
                  formatFn={formatNumber}
                  className="inline"
                />
                {" SOL"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-eva-text-dim uppercase tracking-wider mb-1 text-right">
                Round PNL
              </div>
              <div className={clsx(
                "font-mono text-xl font-semibold text-right",
                roundPnl >= 0 ? "text-eva-primary" : "text-eva-danger",
              )}>
                {roundPnl >= 0 ? "+" : ""}
                <AnimatedNumber
                  value={roundPnl}
                  formatFn={formatNumber}
                  className="inline"
                />
                {" SOL"}
              </div>
            </div>
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

        {/* Agent Reasoning - Independent Block */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <LightbulbIcon className="text-eva-primary" />
            <span className="text-[10px] text-eva-text-dim uppercase tracking-wider">
              AGENT REASONING
            </span>
          </div>

          {thinkingStatus === "thinking" ? (
            <div className="bg-eva-dark/50 border border-eva-primary/30 rounded-lg overflow-hidden animate-pulse">
              <div className="flex items-center gap-3 p-3">
                <div className="relative">
                  <div className="w-5 h-5 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 w-5 h-5 border-2 border-eva-primary/20 rounded-full animate-ping" />
                </div>
                <span className="text-sm text-eva-text">
                  Thinking<ThinkingDots />
                </span>
              </div>
            </div>
          ) : (thinkingStatus === "action" || thinkingStatus === "inaction" || latestThinkReason) ? (
            <div className={clsx(
              "bg-eva-dark/50 border rounded-lg overflow-hidden transition-all duration-500",
              thinkingStatus === "action" || latestThinkReason?.status === "ACTION"
                ? "border-eva-primary/50"
                : "border-eva-border",
              isReasoningPulsing && "ring-2 ring-eva-primary/50 ring-offset-2 ring-offset-eva-darker shadow-lg shadow-eva-primary/20"
            )}>
              {/* Accordion Header */}
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-eva-card-hover transition-colors text-left"
                onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-eva-text-dim">Latest:</span>
                  <span className={clsx(
                    "text-sm font-medium",
                    thinkingStatus === "action" || latestThinkReason?.status === "ACTION"
                      ? "text-eva-primary"
                      : "text-eva-text"
                  )}>
                    {thinkReasonActivity?.reason?.action || (
                      thinkingStatus === "action" || latestThinkReason?.status === "ACTION"
                        ? "Execute Trade"
                        : "Hold"
                    )}
                  </span>
                </div>
                <ChevronIcon isExpanded={isReasoningExpanded} className="text-eva-text-dim" />
              </button>

              {/* Accordion Content */}
              <div
                className={clsx(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  isReasoningExpanded ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="px-3 pb-3 border-t border-eva-border/50">
                  {/* Chain of Thought - Bullet Points */}
                  <div className="mt-3">
                    <div className="text-[10px] text-eva-text-dim uppercase tracking-wider mb-2">
                      Chain of Thought
                    </div>
                    {thinkReasonActivity?.reason?.content ? (
                      <ul className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {thinkReasonActivity.reason.content
                          .split(/\n+|(?<=[.!?])\s{2,}|(?<=[.!?])\s+(?=[A-Z])/)
                          .filter((point: string) => point.trim().length > 0)
                          .slice(0, 4)
                          .map((point: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 p-1.5 rounded bg-eva-dark/50 border-l-2 border-eva-primary/40">
                              <span className="text-eva-primary text-[10px] font-bold mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-eva-primary/20 flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span className="text-xs text-eva-text leading-relaxed">{point.trim()}</span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-eva-text-dim">No reasoning available</p>
                    )}
                  </div>

                  {/* View More Link */}
                  <button
                    className="mt-3 text-[10px] text-eva-primary hover:text-eva-primary-dim transition-colors uppercase tracking-wider"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsReasoningModalOpen(true);
                    }}
                  >
                    View Full Details →
                  </button>
                </div>
              </div>
            </div>
          ) : isThinkReasonLoading ? (
            <div className="flex items-center gap-2 p-3 bg-eva-dark/50 border border-eva-border rounded-lg">
              <div className="w-4 h-4 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-eva-text-dim">Loading reasoning...</span>
            </div>
          ) : (
            <div className="p-3 bg-eva-dark/50 border border-eva-border rounded-lg">
              <span className="text-xs text-eva-text-dim">No reasoning data yet</span>
            </div>
          )}
        </div>

        {/* Execution Logs */}
        <div>
          <div className="text-[10px] text-eva-text-dim uppercase tracking-wider mb-2">
            MY TRADES
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
              executionLogs.map((log, index) => (
                <div
                  key={log.id}
                  className={clsx(
                    "grid grid-cols-3 text-xs py-1.5 px-2 rounded transition-all duration-500",
                    newTradeIds.has(log.id) && "animate-slide-in bg-eva-primary/10 border-l-2 border-eva-primary"
                  )}
                  style={{
                    animationDelay: newTradeIds.has(log.id) ? `${index * 100}ms` : '0ms'
                  }}
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
                  <span className={clsx(
                    "font-mono text-[10px] justify-self-end",
                    newTradeIds.has(log.id) ? "text-eva-primary font-medium" : "text-eva-text-dim"
                  )}>
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
      </div>
    </>
  );

  if (embedded) {
    return <div className="relative">{content}</div>;
  }

  return (
    <EvaCard className="relative">
      <EvaCardContent>{content}</EvaCardContent>
    </EvaCard>
  );
}
