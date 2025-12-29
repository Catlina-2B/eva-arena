import type { Agent } from "@/types";
import type { TransactionDto, TransactionType } from "@/types/api";

import clsx from "clsx";
import { useMemo } from "react";

import { EvaCard, EvaCardContent, EvaBadge, EvaButton } from "@/components/ui";
import { useUserTransactions } from "@/hooks";

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
  /** Whether the toggle operation is in progress */
  isToggling?: boolean;
  onStartSystem?: () => void;
  onPauseSystem?: () => void;
  onEditName?: () => void;
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

export function AgentDashboardCard({
  agent,
  tokenBalance,
  tokenChangePercent,
  solBalance,
  totalPnl,
  roundPnl,
  trenchId,
  isToggling = false,
  onStartSystem,
  onPauseSystem,
  onEditName,
}: AgentDashboardCardProps) {
  const isRunning = agent.status === "running";
  const isPaused = agent.status === "paused";

  // Fetch user's transactions for this trench
  const { data: transactionsData, isLoading: isTransactionsLoading } =
    useUserTransactions(trenchId, { limit: 10, txType: ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAW', 'PRIZE'] });

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
    <EvaCard>
      <EvaCardContent className="py-4">
        {/* Agent Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AgentAvatar avatar={agent.avatar} name={agent.name} />
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-wide text-eva-text">
                {agent.name}
              </span>
              <button
                className="text-eva-text-dim hover:text-eva-text transition-colors p-1"
                onClick={onEditName}
              >
                <EditIcon />
              </button>
            </div>
          </div>
          <EvaBadge
            variant={isPaused ? "warning" : isRunning ? "success" : "default"}
          >
            {isPaused ? "PAUSED" : isRunning ? "RUNNING" : "STOPPED"}
          </EvaBadge>
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
            isPaused 
              ? "text-black bg-[#D357E0] hover:bg-[#C045CF]"
              : "text-black bg-eva-primary hover:bg-eva-primary-dim"
          )}
          style={{
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)"
          }}
          disabled={isToggling}
          onClick={isPaused ? onStartSystem : onPauseSystem}
        >
          {isToggling ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              UPDATING...
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
      </EvaCardContent>
    </EvaCard>
  );
}
