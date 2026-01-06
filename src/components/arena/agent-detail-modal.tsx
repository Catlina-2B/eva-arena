import { Fragment, useMemo } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

import type { AgentRanking, ActivityItem } from "@/types";
import { formatSmallNumber, transactionsToActivities } from "@/lib/trench-utils";
import { useUserTransactions } from "@/hooks";

// Robot icon SVG
const RobotIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="8" y="10" width="16" height="14" rx="2" stroke="#6ce182" strokeWidth="1.5" />
    <circle cx="12" cy="16" r="2" fill="#6ce182" />
    <circle cx="20" cy="16" r="2" fill="#6ce182" />
    <path d="M13 21h6" stroke="#6ce182" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 6v4" stroke="#6ce182" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="5" r="1.5" fill="#6ce182" />
    <path d="M6 14v6" stroke="#6ce182" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M26 14v6" stroke="#6ce182" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// External link icon
const ExternalLinkIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 8.66667V12.6667C12 13.0203 11.8595 13.3594 11.6095 13.6095C11.3594 13.8595 11.0203 14 10.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V5.33333C2 4.97971 2.14048 4.64057 2.39052 4.39052C2.64057 4.14048 2.97971 4 3.33333 4H7.33333"
      stroke="#6B7280"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 2H14V6"
      stroke="#6B7280"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.66675 9.33333L14.0001 2"
      stroke="#6B7280"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Action type label component
function ActionLabel({ type }: { type: "buy" | "sell" | "deposit" | "withdraw" }) {
  const config = {
    buy: { label: "BUY", bgColor: "bg-[rgba(108,225,130,0.1)]", textColor: "text-[#6ce182]" },
    sell: { label: "SELL", bgColor: "bg-[rgba(248,113,113,0.1)]", textColor: "text-[#f87171]" },
    deposit: { label: "DEPOSIT", bgColor: "bg-[rgba(108,225,130,0.1)]", textColor: "text-[#6ce182]" },
    withdraw: { label: "WITHDRAW", bgColor: "bg-[rgba(248,113,113,0.1)]", textColor: "text-[#f87171]" },
  };

  const { label, bgColor, textColor } = config[type] || config.buy;

  return (
    <div className={clsx("px-2 py-0.5 rounded-sm w-12 flex items-center justify-center", bgColor)}>
      <span className={clsx("text-[10px] font-semibold font-mono uppercase tracking-wider", textColor)}>
        {label}
      </span>
    </div>
  );
}

// Metric row component
function MetricRow({
  label,
  value,
  valueColor = "text-white",
  hasBorder = true,
}: {
  label: string;
  value: string;
  valueColor?: string;
  hasBorder?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between py-2",
        hasBorder && "border-b border-dashed border-[rgba(255,255,255,0.1)]"
      )}
    >
      <span className="text-sm text-[#9ca3af] font-mono">{label}</span>
      <span className={clsx("text-sm font-mono", valueColor)}>{value}</span>
    </div>
  );
}

// Activity row component
function ActivityRow({
  activity,
  onExternalLink,
}: {
  activity: ActivityItem;
  onExternalLink?: (signature: string) => void;
}) {
  // Always show only SOL amount
  const actionText = `${formatSmallNumber(activity.solAmount)} SOL`;

  // Show price for buy/sell transactions
  const isDepositOrWithdraw = activity.type === "deposit" || activity.type === "withdraw";
  const priceText = isDepositOrWithdraw
    ? ""
    : `@${formatSmallNumber(activity.solAmount / activity.tokenAmount)}`;

  const timeAgo = getTimeAgo(activity.timestamp);

  return (
    <div className="flex items-center justify-between p-2 rounded">
      <div className="flex items-center gap-4">
        <ActionLabel type={activity.type} />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-white font-mono font-medium">{actionText}</span>
          {priceText && (
            <span className="text-[10px] text-[#4b5563] font-mono">{priceText}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs text-eva-primary font-mono font-medium">
            {activity.agentName}
          </span>
          <span className="text-[10px] text-[#4b5563] font-mono">{timeAgo}</span>
        </div>
        {activity.signature && (
          <button
            className="text-[#6b7280] hover:text-white transition-colors"
            onClick={() => onExternalLink?.(activity.signature!)}
          >
            <ExternalLinkIcon />
          </button>
        )}
      </div>
    </div>
  );
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${Math.floor(diffHour / 24)}d ago`;
}

// Agent detail data interface
export interface AgentDetailData {
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  solBalance: number;
  tokenBalance: number;
  roundPnl: number;
  totalPnl: number;
  recentActions: ActivityItem[];
}

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentRanking | null;
  /** Current trench ID for fetching transactions */
  trenchId?: number;
  /** Optional detailed data loaded from API */
  detailData?: AgentDetailData | null;
  /** Callback when user wants to view transaction on explorer */
  onViewTransaction?: (signature: string) => void;
}

export function AgentDetailModal({
  isOpen,
  onClose,
  agent,
  trenchId,
  detailData,
  onViewTransaction,
}: AgentDetailModalProps) {
  // Fetch transactions using agent's userAddress
  const { data: transactionsData, isLoading: isLoadingTransactions } = useUserTransactions(
    isOpen && agent?.userAddress ? trenchId : undefined,
    {
      userAddress: agent?.userAddress,
      limit: 3,
      txType: ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAW'],
    },
    { polling: false }
  );

  // Convert transactions to activities
  const recentActions = useMemo(() => {
    if (detailData?.recentActions && detailData.recentActions.length > 0) {
      return detailData.recentActions;
    }
    if (!transactionsData?.transactions) return [];
    return transactionsToActivities(transactionsData.transactions).slice(0, 3);
  }, [detailData?.recentActions, transactionsData?.transactions]);

  if (!isOpen || !agent) return null;

  // Use detail data if available, otherwise use ranking data with defaults
  const solBalance = detailData?.solBalance ?? 0;
  const tokenBalance = detailData?.tokenBalance ?? agent.tokenAmount;
  const roundPnl = detailData?.roundPnl ?? agent.pnlSol;
  const totalPnl = detailData?.totalPnl ?? agent.pnlSol;

  const handleExternalLink = (signature: string) => {
    if (onViewTransaction) {
      onViewTransaction(signature);
    } else {
      // Default: open Solscan
      window.open(`https://solscan.io/tx/${signature}`, "_blank");
    }
  };

  return createPortal(
    <Fragment>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-none">
        <div
          aria-modal="true"
          className="relative bg-eva-darker border border-eva-border shadow-2xl pointer-events-auto animate-slide-up w-full max-w-[900px]"
          role="dialog"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 p-1 rounded-lg text-eva-text-dim hover:text-eva-text hover:bg-eva-card-hover transition-colors z-10"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>

          {/* Content */}
          <div className="p-10 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative w-16 h-16 border border-[rgba(108,225,130,0.3)] bg-[rgba(108,225,130,0.05)] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[rgba(108,225,130,0.1)] blur-md" />
                {agent.agentAvatar ? (
                  <img
                    src={agent.agentAvatar}
                    alt={agent.agentName}
                    className="relative w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative">
                    <RobotIcon />
                  </div>
                )}
              </div>

              {/* Agent info */}
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[10px] text-[#6b7280] font-mono uppercase tracking-widest">
                  Robot
                </span>
                <h2 className="text-3xl text-white font-mono uppercase tracking-tight">
                  {agent.agentName}
                </h2>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgba(255,255,255,0.1)]" />

            {/* Cards */}
            <div className="flex gap-8">
              {/* Unit Metrics Card */}
              <div className="flex-1 relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-6">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-[rgba(255,255,255,0.2)]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[rgba(255,255,255,0.2)]" />

                <h3 className="text-lg text-white font-mono tracking-tight mb-6">
                  UNIT METRICS
                </h3>

                <div className="space-y-4">
                  <MetricRow label="SOL Balance" value={formatSmallNumber(solBalance)} />
                  <MetricRow label="Token Balance" value={tokenBalance.toLocaleString()} />
                  <MetricRow
                    label="Round PNL"
                    value={`${roundPnl >= 0 ? "+" : ""}${formatSmallNumber(roundPnl)} SOL`}
                    valueColor={roundPnl >= 0 ? "text-[#6ce182]" : "text-[#f87171]"}
                  />
                  <MetricRow
                    label="Total PNL"
                    value={`${totalPnl >= 0 ? "+" : ""}${formatSmallNumber(totalPnl)} SOL`}
                    valueColor={totalPnl >= 0 ? "text-[#6ce182]" : "text-[#f87171]"}
                    hasBorder={false}
                  />
                </div>
              </div>

              {/* Last Action Card */}
              <div className="flex-1 relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-6">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-[rgba(255,255,255,0.2)]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[rgba(255,255,255,0.2)]" />

                <h3 className="text-lg text-white font-mono tracking-tight mb-6">
                  LAST ACTION
                </h3>

                <div className="space-y-3">
                  {isLoadingTransactions ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : recentActions.length > 0 ? (
                    recentActions.slice(0, 3).map((action) => (
                      <ActivityRow
                        key={action.id}
                        activity={action}
                        onExternalLink={handleExternalLink}
                      />
                    ))
                  ) : (
                    <div className="text-sm text-eva-text-dim font-mono text-center py-8">
                      No recent actions
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>,
    document.body,
  );
}

