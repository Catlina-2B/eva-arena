import type { AgentRanking } from "@/types";

import clsx from "clsx";

import { RankBadge } from "@/components/ui";
import { HeartFilledIcon } from "@/components/icons";

// System Idle icon for empty state
const SystemIdleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 6V18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 10V18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 8V18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Info icon for footer
const InfoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z" stroke="#9CA3AF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 8V6" stroke="#9CA3AF" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 4H6.005" stroke="#9CA3AF" strokeLinecap="round" strokeLinejoin="round"/>
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
}

export function LiveRankings({ 
  rankings, 
  currentUser,
  thirdPlaceTokenAmount = 0,
  isSkipped = false 
}: LiveRankingsProps) {
  // Only show current user section if they exist and are not in top 3
  const showCurrentUserSection = currentUser && currentUser.rank > 3;
  
  // Calculate gap to podium (difference between 3rd place and current user)
  const gapToPodium = showCurrentUserSection 
    ? Math.max(0, thirdPlaceTokenAmount - currentUser.tokenAmount) 
    : 0;

  return (
    <div className="border border-eva-border overflow-hidden relative">
      {/* Header badge */}
      <div className="absolute -top-1 right-0">
        <span className="text-[10px] text-[#9CA3AF] uppercase tracking-[0.15em] font-mono bg-gray-800 px-2 py-1">
          Live Rankings
        </span>
      </div>

      {isSkipped ? (
        // Empty state when round is skipped
        <div className="p-3 pt-8">
          <div className="border border-dashed border-eva-border flex flex-col items-center justify-center py-8 px-4">
            <div className="w-12 h-12 rounded-full bg-eva-darker flex items-center justify-center mb-4">
              <SystemIdleIcon />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wider mb-2">
              SYSTEM IDLE
            </h3>
            <p className="text-xs text-eva-text-dim text-center max-w-[240px] leading-relaxed">
              Due to no bets being placed during the free betting phase, the current round is skipped.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 Rankings list */}
          <div className="p-3 pt-8 space-y-4">
            <div className="space-y-4">
              {rankings.slice(0, 3).map((agent) => (
                <RankingRow key={agent.agentId} agent={agent} />
              ))}
            </div>

            {/* Current user section (when not in top 3) */}
            {showCurrentUserSection && (
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
                <RankingRow agent={currentUser} />

                {/* Prize distribution info */}
                <div className="bg-[rgba(31,41,55,0.3)] border border-eva-border flex items-center gap-2 px-3 py-2">
                  <InfoIcon />
                  <span className="text-[10px] text-eva-text-dim font-mono">
                    Top 3 take 95% Prize | Rest share 5%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer note (only show when current user section is not shown) */}
          {!showCurrentUserSection && (
            <div className="px-3 pb-3">
              <div className="px-3 py-3 border border-eva-border text-xs text-eva-text-dim flex items-start gap-2 bg-eva-darker/50">
                <span className="text-eva-text-dim">ℹ️</span>
                <span className="font-mono">
                  After betting phase ends, 80% to Prize, 20% to Bonding Curve.
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface RankingRowProps {
  agent: AgentRanking;
}

function RankingRow({ agent }: RankingRowProps) {
  const isFirst = agent.rank === 1;

  return (
    <div
      className={clsx(
        "flex items-center justify-between px-3 py-3 border transition-colors",
        isFirst && "border-l-2 border-l-eva-primary",
        "border-eva-border",
        "bg-eva-darker/50 border-eva-border hover:bg-eva-card-hover",
      )}
    >
      <div className="flex items-center gap-3">
        <RankBadge rank={agent.rank} />
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
            {agent.tokenAmount.toLocaleString()} Tokens
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className={clsx(
          "text-sm font-mono font-medium",
          agent.prizeAmount >= 0 ? "text-eva-primary" : "text-eva-danger"
        )}>
          {agent.prizeAmount.toFixed(2)} SOL
        </div>
        <div className="text-[11px] text-eva-text-dim font-mono">
          {agent.supplyPercentage.toFixed(1)}% Supply
        </div>
      </div>
    </div>
  );
}
