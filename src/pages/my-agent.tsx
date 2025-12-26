import type { AgentHistoryRound } from "@/types";
import type {
  AgentItemDto,
  PnlTimelineItemDto,
  TransactionDto,
  TransactionType,
  TrenchHistoryItemDto,
} from "@/types/api";

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";
import { EvaCard, EvaCardContent, EvaButton, EvaBadge } from "@/components/ui";
import { DepositModal, EditAgentModal, StartTimingModal, WithdrawModal } from "@/components/agent";
import { ConnectWalletPrompt } from "@/components/wallet/connect-wallet-prompt";
import {
  useMyAgents,
  useAgent,
  useAgentPanel,
  useTrenchHistory,
  useUserTransactions,
  useToggleAgentStatus,
  useAgentWithdraw,
  useUserPnlTimeline,
  useTurnkeyBalance,
} from "@/hooks";
import { useIsAuthenticated } from "@/hooks/use-auth";

// Corner decoration component
interface CornerDecorationProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

function CornerDecoration({ position }: CornerDecorationProps) {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0 rotate-90",
    "bottom-left": "bottom-0 left-0 -rotate-90",
    "bottom-right": "bottom-0 right-0 rotate-180",
  }[position];

  return (
    <div
      className={`absolute ${positionClasses} w-3 h-3 pointer-events-none z-20`}
    >
      <svg fill="none" height="12" viewBox="0 0 12 12" width="12">
        <path d="M0 0 L12 0 L12 1 L1 1 L1 12 L0 12 Z" fill="#ffffff" />
      </svg>
    </div>
  );
}

// PNL Chart Component - Simple SVG line chart
interface PnlChartProps {
  timeline?: PnlTimelineItemDto[];
  isLoading?: boolean;
}

function PnlChart({ timeline, isLoading }: PnlChartProps) {
  // Convert timeline data to chart points (convert lamports to SOL)
  const dataPoints = useMemo(() => {
    if (!timeline || timeline.length === 0) {
      return [];
    }

    return timeline.map((item) => parseFloat(item.pnl) / 1e9);
  }, [timeline]);

  // Generate SVG path
  const width = 280;
  const height = 140;
  const padding = 10;

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Empty state - show flat line
  if (dataPoints.length === 0) {
    return (
      <svg
        className="w-full h-full"
        preserveAspectRatio="none"
        viewBox={`0 0 ${width} ${height}`}
      >
        <line
          stroke="#00ff88"
          strokeOpacity="0.3"
          strokeWidth="2"
          x1={padding}
          x2={width - padding}
          y1={height / 2}
          y2={height / 2}
        />
        <text
          className="text-[10px]"
          fill="#666"
          textAnchor="middle"
          x={width / 2}
          y={height / 2 + 20}
        >
          No PNL data
        </text>
      </svg>
    );
  }

  const maxValue = Math.max(...dataPoints);
  const minValue = Math.min(...dataPoints);
  const range = maxValue - minValue || 1; // Avoid division by zero

  const points = dataPoints.map((value, index) => {
    const x =
      padding + (index / (dataPoints.length - 1 || 1)) * (width - 2 * padding);
    const y =
      height - padding - ((value - minValue) / range) * (height - 2 * padding);

    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Create gradient fill area
  const areaD = `M ${padding},${height - padding} L ${pathD.slice(2)} L ${width - padding},${height - padding} Z`;

  // Determine color based on overall PNL trend (last value vs first value)
  const isPositive = dataPoints[dataPoints.length - 1] >= dataPoints[0];
  const strokeColor = isPositive ? "#00ff88" : "#ff4444";

  return (
    <svg
      className="w-full h-full"
      preserveAspectRatio="none"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGradient)" />
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" />
    </svg>
  );
}

// Trade Type Badge Component
function TradeTypeBadge({ type }: { type: TransactionType }) {
  const config: Record<
    string,
    {
      variant: "primary" | "success" | "danger" | "warning" | "default";
      label: string;
    }
  > = {
    CLAIM: { variant: "primary", label: "CLAIM" },
    BUY: { variant: "success", label: "BUY" },
    SELL: { variant: "danger", label: "SELL" },
    WITHDRAW: { variant: "warning", label: "WITHDRAW" },
    DEPOSIT: { variant: "default", label: "DEPOSIT" },
  };

  const { variant, label } = config[type] ?? { variant: "default" as const, label: type };

  return <EvaBadge variant={variant}>{label}</EvaBadge>;
}

// Trade History Table Component
function TradeHistoryTable({
  transactions,
  total,
  isLoading,
}: {
  transactions: TransactionDto[];
  total: number;
  isLoading?: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(total / itemsPerPage);

  const formatTime = (
    blockTime: number | null | undefined,
    createdAt: string,
  ) => {
    const date = blockTime ? new Date(blockTime * 1000) : new Date(createdAt);

    return date.toLocaleTimeString("en-US", { hour12: false });
  };

  const formatTokenAmount = (amount: string | null) => {
    if (!amount) return "-";
    const value = parseFloat(amount) / 1e9; // Convert from lamports

    return value.toFixed(2);
  };

  const formatSolAmount = (amount: string | null) => {
    if (!amount) return "-";
    const value = parseFloat(amount) / 1e9; // Convert from lamports

    return `${value.toFixed(4)} SOL`;
  };

  const openTxExplorer = (signature: string) => {
    window.open(`https://solscan.io/tx/${signature}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="mt-4 bg-eva-darker rounded-lg border border-eva-border p-8 text-center">
        <div className="w-6 h-6 border-2 border-eva-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-eva-text-dim">
          Loading transactions...
        </span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="mt-4 bg-eva-darker rounded-lg border border-eva-border p-8 text-center">
        <span className="text-xs text-eva-text-dim">
          No transactions found for this round.
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-eva-darker rounded-lg border border-eva-border">
      {/* Table Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-eva-border">
        <svg
          className="w-4 h-4 text-eva-text-dim"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
        <span className="text-xs font-mono text-eva-text-dim uppercase tracking-wider">
          TRADE HISTORY
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-eva-border text-eva-text-dim text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-medium">Time</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Token Amount</th>
              <th className="px-4 py-3 text-left font-medium">SOL Amount</th>
              <th className="px-4 py-3 text-center font-medium">Tx</th>
              <th className="px-4 py-3 text-center font-medium">Reasoning</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.signature}
                className="border-b border-eva-border/50 hover:bg-eva-card-hover transition-colors"
              >
                <td className="px-4 py-3 font-mono text-eva-text">
                  {formatTime(tx.blockTime, tx.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <TradeTypeBadge type={tx.txType} />
                </td>
                <td className="px-4 py-3 font-mono text-eva-text">
                  {formatTokenAmount(tx.tokenAmount)}
                </td>
                <td className="px-4 py-3 font-mono text-eva-text">
                  {formatSolAmount(tx.solAmount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    className="text-eva-text-dim hover:text-eva-primary transition-colors"
                    onClick={() => openTxExplorer(tx.signature)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  {tx.reasoningOutput ? (
                    <button
                      className="text-eva-text-dim hover:text-eva-primary transition-colors"
                      title={tx.reasoningOutput}
                    >
                      <svg
                        className="w-4 h-4"
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
                    </button>
                  ) : (
                    <span className="text-eva-text-dim">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-eva-border">
          <span className="text-xs text-eva-text-dim">Total {total} Items</span>
          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(3, totalPages) },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                className={`w-7 h-7 text-xs rounded ${
                  currentPage === page
                    ? "bg-eva-primary text-eva-dark font-semibold"
                    : "text-eva-text-dim hover:bg-eva-card-hover hover:text-eva-text"
                } transition-colors`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            {totalPages > 3 && (
              <>
                <span className="text-eva-text-dim px-2">...</span>
                <button
                  className="w-7 h-7 text-xs rounded text-eva-text-dim hover:bg-eva-card-hover hover:text-eva-text transition-colors"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              className="w-7 h-7 text-xs rounded text-eva-text-dim hover:bg-eva-card-hover hover:text-eva-text transition-colors disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
            >
              <svg
                className="w-4 h-4 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// History Row Component
function HistoryRow({
  round,
  trenchId,
  isExpanded,
  onToggle,
}: {
  round: AgentHistoryRound;
  trenchId: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  // Fetch user's transactions only when expanded (no polling for history)
  // Use logged-in user's wallet address (not turnkey address)
  const { data: transactionsData, isLoading: isTransactionsLoading } =
    useUserTransactions(
      isExpanded ? trenchId : undefined,
      isExpanded ? { limit: 50 } : undefined,
      { polling: false },
    );

  return (
    <div className={isExpanded ? "bg-eva-card-hover rounded-lg" : ""}>
      {/* Row Header */}
      <button
        className="flex items-center justify-between w-full px-4 py-4 cursor-pointer hover:bg-eva-card-hover transition-colors rounded-lg text-left"
        type="button"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-sm ${round.pnl >= 0 ? "bg-eva-primary" : "bg-eva-text-dim"}`}
          />
          <div>
            <div className="text-sm font-mono text-eva-text">
              ROUND: {round.tokenName}
            </div>
            <div className="text-xs text-eva-text-dim">
              Trades: {round.trades}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-xs text-eva-text-dim uppercase tracking-wider">
              PNL
            </div>
            <div
              className={`text-sm font-mono ${round.pnl >= 0 ? "text-eva-primary" : "text-eva-danger"}`}
            >
              {round.pnl >= 0 ? "+" : ""}
              {round.pnl.toFixed(4)} SOL
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-eva-text-dim uppercase tracking-wider">
              PRIZE
            </div>
            <div className="text-sm font-mono text-eva-text">
              {round.prize.toFixed(4)} SOL
            </div>
          </div>
          <span className="text-eva-text-dim hover:text-eva-text transition-colors">
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
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
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <TradeHistoryTable
            isLoading={isTransactionsLoading}
            total={transactionsData?.total ?? 0}
            transactions={transactionsData?.transactions ?? []}
          />
        </div>
      )}
    </div>
  );
}

// Extended history round with trench ID
interface ExtendedHistoryRound extends AgentHistoryRound {
  trenchDbId: number;
}

// Convert API trench history item to history round format
function historyItemToRound(item: TrenchHistoryItemDto): ExtendedHistoryRound {
  const pnlSol = parseFloat(item.pnlSol) / 1e9;
  const prizeSol = parseFloat(item.prizeAmount) / 1e9;

  return {
    roundId: `eva-${item.trenchId}`,
    tokenName: item.tokenSymbol || `Round ${item.trenchId}`,
    rank: item.rank ?? 0,
    pnl: pnlSol,
    prize: prizeSol,
    trades: 0, // Not available in TrenchHistoryItemDto, could be calculated from transactions
    trenchDbId: item.trenchId,
  };
}

// Play icon component
function PlayIcon() {
  return (
    <svg
      className="w-5 h-5"
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
function PauseIcon() {
  return (
    <svg
      className="w-5 h-5"
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

// Agent Info Component
function AgentInfo({
  agent,
  onToggleStatus,
  onEdit,
  isToggling,
}: {
  agent: AgentItemDto;
  onToggleStatus: () => void;
  onEdit: () => void;
  isToggling?: boolean;
}) {
  const isActive = agent.status === "ACTIVE";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr)
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };

  return (
    <div className="relative bg-eva-card border border-eva-border overflow-hidden">
      <CornerDecoration position="top-left" />
      <CornerDecoration position="top-right" />
      <CornerDecoration position="bottom-left" />
      <CornerDecoration position="bottom-right" />

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Agent Logo or Icon */}
            <div className="w-16 h-16 rounded-lg bg-eva-darker border border-eva-border flex items-center justify-center overflow-hidden">
              {agent.logo ? (
                <img
                  alt={agent.name}
                  className="w-full h-full object-cover"
                  src={agent.logo}
                />
              ) : (
                <svg
                  className="w-8 h-8 text-eva-text-dim"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                  />
                </svg>
              )}
            </div>

            {/* Agent Info */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-eva-text">
                  {agent.name}
                </h2>
                <EvaBadge
                  variant={agent.status === "ACTIVE" ? "success" : "default"}
                >
                  {agent.status}
                </EvaBadge>
                <button
                  className="text-eva-text-dim hover:text-eva-primary transition-colors"
                  title="Edit Agent"
                  onClick={onEdit}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-1 text-xs text-eva-text-dim mt-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span>Create Time: {formatDate(agent.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Status Toggle Button */}
          <button
            disabled={isToggling}
            className={`h-[44px] min-w-[240px] px-8 text-sm font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
              isActive 
                ? "text-black bg-eva-primary hover:bg-eva-primary-dim"
                : "text-black bg-[#D357E0] hover:bg-[#C045CF]"
            }`}
            style={{
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)"
            }}
            onClick={onToggleStatus}
          >
            {isToggling ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isActive ? "PAUSING..." : "STARTING..."}
              </>
            ) : (
              <>
                <div className="bg-black px-[1px] py-[1px]">
                  {isActive ? <PauseIcon /> : <PlayIcon />}
                </div>
                {isActive ? "PAUSE" : "START"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyAgentPage() {
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStartTimingModalOpen, setIsStartTimingModalOpen] = useState(false);

  // Auth state
  const { isAuthenticated } = useIsAuthenticated();

  // Fetch user's agents
  const { data: agentsData, isLoading: isAgentsLoading, refetch: refetchAgents } = useMyAgents();
  const agents = agentsData?.agents ?? [];
  const primaryAgent = agents[0];

  // Fetch full agent detail (includes strategy prompts)
  const { data: agentDetail, refetch: refetchAgentDetail } = useAgent(primaryAgent?.id);

  // Fetch agent panel data
  const {
    data: panelData,
    isLoading: isPanelLoading,
    error: panelError,
    refetch: refetchPanel,
  } = useAgentPanel(primaryAgent?.id);

  // Toggle agent status mutation
  const toggleStatusMutation = useToggleAgentStatus();

  // Withdraw mutation
  const withdrawMutation = useAgentWithdraw();

  // Subscribe to Turnkey wallet balance updates via WebSocket
  const { balance: turnkeyBalance } = useTurnkeyBalance(primaryAgent?.turnkeyAddress);

  // Fetch user trench history
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useTrenchHistory({ limit: 10 });

  // Fetch user PNL timeline
  const { data: pnlTimelineData, isLoading: isPnlTimelineLoading } =
    useUserPnlTimeline();

  // Convert history items to history rounds
  const historyRounds = useMemo(() => {
    if (!historyData?.history) return [];

    return historyData.history.map(historyItemToRound);
  }, [historyData]);

  // Set first round as expanded by default
  useMemo(() => {
    if (historyRounds.length > 0 && expandedRound === null) {
      setExpandedRound(historyRounds[0].roundId);
    }
  }, [historyRounds, expandedRound]);

  // Loading state
  if (isAgentsLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-eva-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-eva-text-dim font-mono text-sm">
              LOADING AGENT...
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <ConnectWalletPrompt />
        </div>
      </DefaultLayout>
    );
  }

  // No agent
  if (!primaryAgent) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-eva-text font-mono text-lg mb-2">
              NO AGENT FOUND
            </p>
            <p className="text-eva-text-dim text-sm mb-4">
              You haven&apos;t created an agent yet.
            </p>
            <Link to="/create-agent">
              <EvaButton variant="primary">CREATE AGENT</EvaButton>
            </Link>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Use real API data with Turnkey balance WebSocket subscription
  const displayAgent = primaryAgent;
  // Prefer Turnkey balance (real-time WebSocket) over panel balance (API polling)
  const balance = turnkeyBalance || panelData?.currentBalance || 0;
  const totalDeposit = panelData?.totalDeposited ?? 0;
  const totalWithdraw = panelData?.totalWithdrawn ?? 0;
  const pnl = panelData?.totalPnl ?? 0;

  return (
    <DefaultLayout>
      {/* Background Image at Bottom */}
      <div
        className="fixed bottom-0 left-0 w-full h-[400px] pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/bg-my-agent.png')",
          backgroundSize: "100% auto",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="space-y-6 relative z-10">
        {/* Page Header */}
        <h1 className="text-4xl font-bold tracking-wider uppercase text-eva-text italic">
          MY AGENT
        </h1>

        {/* Agent Card */}
        <AgentInfo
          agent={displayAgent}
          isToggling={toggleStatusMutation.isPending}
          onEdit={() => setIsEditModalOpen(true)}
          onToggleStatus={() => {
            // Show timing modal when activating, directly pause when deactivating
            if (displayAgent.status === "ACTIVE") {
              toggleStatusMutation.mutate(displayAgent.id);
            } else {
              setIsStartTimingModalOpen(true);
            }
          }}
        />

        {/* Funds & PnL - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Funds Card */}
          <EvaCard>
            <EvaCardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono text-eva-text-dim uppercase tracking-wider">
                    <span className="text-eva-primary">{`///`}</span> FUNDS
                  </h3>
                  {isPanelLoading && (
                    <div className="w-4 h-4 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {panelError ? (
                  <div className="text-center py-4">
                    <p className="text-eva-danger text-sm">
                      Failed to load funds data
                    </p>
                    <p className="text-eva-text-dim text-xs mt-1">
                      Please try again later
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Available Balance */}
                    <div>
                      <div className="text-xs text-eva-text-dim uppercase tracking-wider mb-1">
                        Available Balance
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="font-mono text-xl font-bold text-eva-text">
                          {balance.toFixed(2)}{" "}
                          <span className="text-sm text-eva-text-dim">SOL</span>
                        </div>
                        <button
                          className="text-xs font-mono text-eva-text-dim hover:text-eva-primary transition-colors cursor-pointer"
                          type="button"
                        >
                          VIEW_LOG_HISTORY &gt;&gt;
                        </button>
                      </div>
                    </div>

                    {/* Deposit & Withdraw Row */}
                    <div className="flex gap-4 p-3 bg-eva-darker rounded-lg border border-eva-border">
                      {/* Total Deposit */}
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-eva-text-dim uppercase tracking-wider mb-0.5">
                            Total Deposit
                          </div>
                          <div className="font-mono text-sm text-eva-text">
                            {totalDeposit.toFixed(2)}
                          </div>
                        </div>
                        <EvaButton
                          size="xs"
                          variant="primary"
                          onClick={() => setIsDepositModalOpen(true)}
                        >
                          DEPOSIT
                        </EvaButton>
                      </div>

                      {/* Divider */}
                      <div className="w-px bg-eva-border" />

                      {/* Total Withdraw */}
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-eva-text-dim uppercase tracking-wider mb-0.5">
                            Total Withdraw
                          </div>
                          <div className="font-mono text-sm text-eva-text">
                            {totalWithdraw.toFixed(2)}{" "}
                            <span className="text-xs text-eva-text-dim">
                              SOL
                            </span>
                          </div>
                        </div>
                        <EvaButton
                          size="xs"
                          variant="outline"
                          onClick={() => setIsWithdrawModalOpen(true)}
                        >
                          WITHDRAW
                        </EvaButton>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </EvaCardContent>
          </EvaCard>

          {/* PnL Card */}
          <EvaCard>
            <EvaCardContent>
              <div className="relative h-full min-h-[160px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xs font-mono text-eva-text-dim uppercase tracking-wider">
                    <span className="text-eva-primary">{`///`}</span> PNL
                  </h3>
                  <div
                    className={`font-mono text-xl font-bold ${pnl >= 0 ? "text-eva-primary" : "text-eva-danger"}`}
                  >
                    {pnl >= 0 ? "+" : ""}
                    {pnl.toFixed(2)} <span className="text-sm">SOL</span>
                  </div>
                </div>

                {/* Chart - Full Width */}
                <div className="absolute inset-x-0 bottom-0 top-8">
                  <PnlChart
                    isLoading={isPnlTimelineLoading}
                    timeline={pnlTimelineData?.timeline}
                  />
                </div>
              </div>
            </EvaCardContent>
          </EvaCard>
        </div>

        {/* History Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xs font-mono text-eva-text-dim uppercase tracking-wider">
              <span className="text-eva-primary">{`///`}</span> History
            </h3>
            {isHistoryLoading && (
              <div className="w-4 h-4 border-2 border-eva-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {historyError ? (
            <div className="text-center py-8">
              <p className="text-eva-danger text-sm">Failed to load history</p>
              <p className="text-eva-text-dim text-xs mt-1">
                Please try again later
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyRounds.map((round) => (
                <EvaCard key={round.roundId}>
                  <HistoryRow
                    isExpanded={expandedRound === round.roundId}
                    round={round}
                    trenchId={round.trenchDbId}
                    onToggle={() =>
                      setExpandedRound(
                        expandedRound === round.roundId ? null : round.roundId,
                      )
                    }
                  />
                </EvaCard>
              ))}
              {!isHistoryLoading && historyRounds.length === 0 && (
                <div className="text-center py-8 text-eva-text-dim">
                  No round history yet. Start trading to see your history here.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        agentName={displayAgent.name}
        depositAddress={displayAgent.turnkeyAddress}
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        isWithdrawing={withdrawMutation.isPending}
        maxBalance={balance}
        onClose={() => setIsWithdrawModalOpen(false)}
        onWithdraw={async (amount, recipientAddress) => {
          await withdrawMutation.mutateAsync({
            id: displayAgent.id,
            data: { amount, toAddress: recipientAddress },
          });
          // Refresh panel data after successful withdrawal
          refetchPanel();
        }}
      />

      {/* Edit Agent Modal */}
      <EditAgentModal
        agent={agentDetail ?? null}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          refetchAgents();
          refetchAgentDetail();
          refetchPanel();
        }}
      />

      {/* Start Timing Modal */}
      <StartTimingModal
        isOpen={isStartTimingModalOpen}
        onClose={() => setIsStartTimingModalOpen(false)}
        onSelectTiming={(timing) => {
          // TODO: Handle timing selection - for now, just activate the agent
          console.log("Start timing selected:", timing);
          toggleStatusMutation.mutate(displayAgent.id);
          setIsStartTimingModalOpen(false);
        }}
        isLoading={toggleStatusMutation.isPending}
      />
    </DefaultLayout>
  );
}
