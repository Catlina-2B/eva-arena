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

interface LiveRankingsProps {
  rankings: AgentRanking[];
  /** Whether the current round is skipped (no bets placed) */
  isSkipped?: boolean;
}

export function LiveRankings({ rankings, isSkipped = false }: LiveRankingsProps) {
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
          {/* Rankings list */}
          <div className="p-3 pt-8 space-y-2">
            {rankings.map((agent) => (
              <RankingRow key={agent.agentId} agent={agent} />
            ))}
          </div>

          {/* Footer note */}
          <div className="px-3 pb-3">
            <div className="px-3 py-3 border border-eva-border text-xs text-eva-text-dim flex items-start gap-2 bg-eva-darker/50">
              <span className="text-eva-text-dim">ℹ️</span>
              <span className="font-mono">
                After betting phase ends, 80% to Prize, 20% to Bonding Curve.
              </span>
            </div>
          </div>
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
          agent.pnlSol >= 0 ? "text-eva-primary" : "text-eva-danger"
        )}>
          {agent.pnlSol >= 0 ? "+" : ""}{agent.pnlSol.toFixed(2)} SOL
        </div>
        <div className="text-[11px] text-eva-text-dim font-mono">
          {agent.supplyPercentage.toFixed(1)}% Supply
        </div>
      </div>
    </div>
  );
}
