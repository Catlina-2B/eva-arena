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
    case "CLAIM":
      return "CLAIM";
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
  };
}

// Transaction type badge component
function TxTypeBadge({ txType }: { txType: TransactionType }) {
  const getTypeStyle = () => {
    switch (txType) {
      case "BUY":
        return "bg-eva-primary/20 text-eva-primary border-eva-primary/30";
      case "SELL":
        return "bg-eva-danger/20 text-eva-danger border-eva-danger/30";
      case "DEPOSIT":
        return "bg-eva-secondary/20 text-eva-secondary border-eva-secondary/30";
      case "WITHDRAW":
        return "bg-eva-warning/20 text-eva-warning border-eva-warning/30";
      case "CLAIM":
        return "bg-eva-success/20 text-eva-success border-eva-success/30";
      default:
        return "bg-eva-card text-eva-text-dim border-eva-border";
    }
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 text-[10px] rounded border font-medium",
        getTypeStyle(),
      )}
    >
      {txType}
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
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

// Pause icon component
function PauseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={clsx("w-5 h-5", className)}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
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
    useUserTransactions(trenchId, { limit: 10 });

  // Convert transactions to execution log entries
  const executionLogs = useMemo(() => {
    if (!transactionsData?.transactions) return [];

    return transactionsData.transactions.map(transactionToLogEntry);
  }, [transactionsData]);

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  };

  // Format token number (no decimals for large numbers)
  const formatTokenNumber = (num: number) => {
    return num.toLocaleString("en-US", {
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
            <div
              className={clsx(
                "text-xs font-mono",
                tokenChangePercent >= 0
                  ? "text-eva-primary"
                  : "text-eva-danger",
              )}
            >
              {tokenChangePercent >= 0 ? "+" : ""}
              {tokenChangePercent.toFixed(2)}%
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
        <EvaButton
          fullWidth
          className="mb-4 tracking-wider"
          disabled={isToggling}
          leftIcon={
            isToggling ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPaused ? (
              <PlayIcon />
            ) : (
              <PauseIcon />
            )
          }
          size="lg"
          variant={isPaused ? "secondary" : "outline"}
          onClick={isPaused ? onStartSystem : onPauseSystem}
        >
          {isToggling
            ? "UPDATING..."
            : isPaused
              ? "START SYSTEM"
              : "PAUSE SYSTEM"}
        </EvaButton>

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
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-eva-text-dim">
                      {formatShortAddress(log.userAddress)}
                    </span>
                    <TxTypeBadge txType={log.txType} />
                  </div>
                  <span className="font-mono text-eva-text-dim">
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
