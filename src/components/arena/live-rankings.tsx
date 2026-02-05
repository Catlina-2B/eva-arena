import { useState } from "react";

import type { AgentRanking } from "@/types";

import clsx from "clsx";

import { RankBadge } from "@/components/ui";
import { HeartFilledIcon } from "@/components/icons";
import { AgentDetailModal, type AgentDetailData } from "./agent-detail-modal";

// System Idle icon for empty state
const SystemIdleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 6V18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 10V18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 8V18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Info icon for footer
const InfoIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z"
      stroke="#9CA3AF"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 8V6"
      stroke="#9CA3AF"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 4H6.005"
      stroke="#9CA3AF"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface LiveRankingsProps {
  rankings: AgentRanking[];
  /** Current user ranking info (when not in top 3) */
  currentUser?: AgentRanking | null;
  /** Token amount of the 3rd place (for calculating gap) */
  thirdPlaceTokenAmount?: number;
  /** Whether the current round is skipped (no bets placed) */
  isSkipped?: boolean;
  /** Whether the current phase is betting phase */
  isBettingPhase?: boolean;
  /** Current trench ID for fetching agent transactions */
  trenchId?: number;
  /** Optional callback to load agent detail data */
  onLoadAgentDetail?: (agentId: string) => Promise<AgentDetailData | null>;
  /** When true, removes outer card styling for embedding in tabs */
  embedded?: boolean;
}

export function LiveRankings({
  rankings,
  currentUser,
  thirdPlaceTokenAmount = 0,
  isSkipped = false,
  isBettingPhase = false,
  trenchId,
  onLoadAgentDetail,
  embedded = false,
}: LiveRankingsProps) {
  // Modal state
  const [selectedAgent, setSelectedAgent] = useState<AgentRanking | null>(null);
  const [agentDetailData, setAgentDetailData] = useState<AgentDetailData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Collapse state - when collapsed, only show user's agent if participating
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Find user's agent in rankings (if in top 3)
  const userAgentInRankings = rankings.find(agent => agent.isCurrentUser || agent.isOwned);

  // Determine if user has participated (either in top 3 or outside top 3)
  const userHasParticipated = !!userAgentInRankings || !!currentUser;

  // Only show current user section if they exist and are not in top 3
  const showCurrentUserSection = currentUser && currentUser.rank > 3;

  // Calculate gap to podium (difference between 3rd place and current user)
  const gapToPodium = showCurrentUserSection
    ? Math.max(0, thirdPlaceTokenAmount - currentUser.tokenAmount)
    : 0;

  // Handle agent row click
  const handleAgentClick = async (agent: AgentRanking) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
    setAgentDetailData(null);

    // Load detail data if callback is provided
    if (onLoadAgentDetail) {
      try {
        const data = await onLoadAgentDetail(agent.agentId);
        setAgentDetailData(data);
      } catch (error) {
        console.error("Failed to load agent detail:", error);
      }
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAgent(null);
    setAgentDetailData(null);
  };

  return (
    <div className={clsx(
      "overflow-hidden relative",
      !embedded && "border border-eva-border"
    )}>
      {/* Header with collapse button */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-eva-primary animate-pulse" />
          <span className="text-[10px] text-[#9CA3AF] uppercase tracking-[0.15em] font-mono">
            Live Rankings
          </span>
        </div>
        <button
          className="flex items-center gap-1 text-[10px] text-eva-text-dim hover:text-eva-text transition-colors font-mono uppercase tracking-wider"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "Expand" : "Collapse"}
          <svg
            className={clsx(
              "w-3 h-3 transition-transform",
              isCollapsed && "rotate-180"
            )}
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
        </button>
      </div>

      {isSkipped ? (
        // Empty state when round is skipped - hide when collapsed
        !isCollapsed && (
          <div className="p-3 pt-8">
            <div className="border border-dashed border-eva-border flex flex-col items-center justify-center py-8 px-4">
              <div className="w-12 h-12 rounded-full bg-eva-darker flex items-center justify-center mb-4">
                <SystemIdleIcon />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-wider mb-2">
                SYSTEM IDLE
              </h3>
              <p className="text-xs text-eva-text-dim text-center max-w-[240px] leading-relaxed">
                Due to no bets being placed during the free betting phase, the
                current round is skipped.
              </p>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Rankings list */}
          <div className="px-3 pb-3 space-y-4">
            {/* When collapsed: show user's agent only if participating, otherwise show nothing */}
            {/* When expanded: show Top 3 */}
            {isCollapsed ? (
              // Collapsed state
              userHasParticipated && (
                <div className="space-y-4">
                  {userAgentInRankings ? (
                    // User is in top 3, show their agent
                    <RankingRow
                      agent={userAgentInRankings}
                      isBettingPhase={isBettingPhase}
                      isCurrentUser={true}
                      onClick={handleAgentClick}
                    />
                  ) : currentUser ? (
                    // User is outside top 3, show currentUser
                    <RankingRow
                      agent={currentUser}
                      isBettingPhase={isBettingPhase}
                      isCurrentUser={true}
                      onClick={handleAgentClick}
                    />
                  ) : null}
                </div>
              )
            ) : (
              // Expanded state - show Top 3
              <div className="space-y-4">
                {rankings.slice(0, 3).map((agent) => (
                  <RankingRow
                    key={agent.agentId}
                    agent={agent}
                    isBettingPhase={isBettingPhase}
                    isCurrentUser={agent.isCurrentUser}
                    onClick={handleAgentClick}
                  />
                ))}
              </div>
            )}

            {/* Current user section (when not in top 3) - hide when collapsed */}
            {!isCollapsed && showCurrentUserSection && (
              <div className="space-y-4">
                {/* Gap to Podium divider */}
                <div className="border-l border-eva-border pl-4 h-12 flex items-center">
                  <div className="relative">
                    {/* Horizontal tick mark */}
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-px bg-eva-border" />
                    <span className="text-[10px] text-eva-text-dim font-mono uppercase tracking-wider">
                      Gap to Podium: {gapToPodium.toLocaleString()} Tokens
                    </span>
                  </div>
                </div>

                {/* Current user ranking row */}
                <RankingRow
                  agent={currentUser}
                  isBettingPhase={isBettingPhase}
                  onClick={handleAgentClick}
                />

                {/* Prize distribution info */}
                <div className="bg-[rgba(31,41,55,0.3)] border border-eva-border flex items-center gap-2 px-3 py-2">
                  <InfoIcon />
                  <span className="text-[10px] text-eva-text-dim font-mono">
                    {isBettingPhase
                      ? "After betting phase ends, 80% to Prize, 20% to Bonding Curve."
                      : "Top 3 take 95% Prize | Rest share 5%"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer note (only show when current user section is not shown and not collapsed) */}
          {!isCollapsed && !showCurrentUserSection && (
            <div className="px-3 pb-3">
              <div className="px-3 py-3 border border-eva-border text-xs text-eva-text-dim flex items-center gap-2 bg-eva-darker/50">
                <InfoIcon />
                <span className="font-mono">
                  {isBettingPhase
                    ? "After betting phase ends, 80% to Prize, 20% to Bonding Curve."
                    : "Top 3 take 95% Prize | Rest share 5%"}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Agent Detail Modal */}
      <AgentDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        agent={selectedAgent}
        trenchId={trenchId}
        detailData={agentDetailData}
      />
    </div>
  );
}

// Default agent avatar
function AgentAvatarIcon({ avatar, name }: { avatar?: string; name: string }) {
  if (avatar) {
    return (
      <img
        alt={name}
        className="w-8 h-8 rounded object-cover border border-eva-border"
        src={avatar}
      />
    );
  }

  // Default EVA-style avatar
  return (
    <div className="w-8 h-8 rounded border border-eva-border bg-eva-dark overflow-hidden flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 32 32">
        <defs>
          <linearGradient id="avatar-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a25" />
            <stop offset="100%" stopColor="#0a0a0f" />
          </linearGradient>
        </defs>
        <rect fill="url(#avatar-bg)" width="32" height="32" />
        <circle cx="16" cy="16" fill="#a855f7" opacity="0.6" r="8" />
        <circle cx="16" cy="16" fill="#e879f9" r="4" />
      </svg>
    </div>
  );
}

interface RankingRowProps {
  agent: AgentRanking;
  /** Whether to show betting phase layout */
  isBettingPhase?: boolean;
  /** Whether this is the current user's agent */
  isCurrentUser?: boolean;
  /** Click handler for opening agent detail */
  onClick?: (agent: AgentRanking) => void;
}

function RankingRow({ agent, isBettingPhase = false, isCurrentUser = false, onClick }: RankingRowProps) {
  const isFirst = agent.rank === 1;
  const isTop3CurrentUser = isCurrentUser && agent.rank <= 3;

  const handleClick = () => {
    onClick?.(agent);
  };

  // Betting phase layout: show avatar, bet amount, and allocation percentage
  if (isBettingPhase) {
    return (
      <div className="border border-[#374151] bg-[#15171e]">
        <div
          className={clsx(
            "flex items-center justify-between p-[13px] transition-colors cursor-pointer",
            isTop3CurrentUser && "border-eva-primary bg-eva-primary/10",
            "hover:bg-eva-card-hover"
          )}
          onClick={handleClick}
        >
          <div className="flex items-center gap-3">
            <RankBadge rank={agent.rank} />
            <AgentAvatarIcon avatar={agent.agentAvatar} name={agent.agentName} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  {agent.agentName}
                </span>
                {agent.isOwned && (
                  <HeartFilledIcon className="w-4 h-4 text-eva-danger" />
                )}
              </div>
              <div className="text-[11px] text-eva-text-dim font-mono">
                Bet {agent.betAmount?.toFixed(2) ?? "0.00"} USDC
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-mono font-medium text-eva-primary">
              +{((agent.allocationPercent ?? 0) / 2).toFixed(1)}%
            </div>
            <div className="text-[10px] text-eva-text-dim font-mono uppercase tracking-wider">
              Alloc
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format token amount with K, M, B suffixes for better readability
  const formatTokenAmount = (amount: number): string => {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
  };

  // Default trading/liquidation phase layout
  return (
    <div className="border border-[#374151] bg-[#15171e]">
      <div
        className={clsx(
          "flex items-center justify-between p-[13px] transition-colors cursor-pointer",
          isTop3CurrentUser && "border-eva-primary bg-eva-primary/10",
          "hover:bg-eva-card-hover"
        )}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <RankBadge rank={agent.rank} />
          <AgentAvatarIcon avatar={agent.agentAvatar} name={agent.agentName} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {agent.agentName}
              </span>
              {agent.isOwned && (
                <HeartFilledIcon className="w-4 h-4 text-eva-danger" />
              )}
            </div>
            <div className="text-[11px] text-eva-text-dim font-mono">
              {formatTokenAmount(agent.tokenAmount)} • {agent.supplyPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="text-right">
          <div
            className={clsx(
              "text-sm font-mono font-medium",
              agent.prizeAmount >= 0 ? "text-[#EAB308]" : "text-eva-danger"
            )}
          >
            {agent.prizeAmount >= 0 ? "+" : ""}{agent.prizeAmount.toFixed(2)} USDC
          </div>
          <div className="text-[10px] text-eva-text-dim font-mono uppercase tracking-wider">
            Prize
          </div>
        </div>
      </div>
    </div>
  );
}
