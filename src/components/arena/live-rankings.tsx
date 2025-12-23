import type { AgentRanking } from "@/types";

import clsx from "clsx";

import { RankBadge } from "@/components/ui";
import { HeartFilledIcon } from "@/components/icons";

interface LiveRankingsProps {
  rankings: AgentRanking[];
}

export function LiveRankings({ rankings }: LiveRankingsProps) {
  return (
    <div className="border border-eva-border overflow-hidden relative">
      {/* Header badge */}
      <div className="absolute -top-1 right-0">
        <span className="text-[10px] text-[#9CA3AF] uppercase tracking-[0.15em] font-mono bg-gray-800 px-2 py-1">
          Live Rankings
        </span>
      </div>

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
        <div className="text-sm font-mono text-eva-primary font-medium">
          +{agent.solValue.toFixed(2)} SOL
        </div>
        <div className="text-[11px] text-eva-text-dim font-mono">
          {agent.supplyPercentage.toFixed(1)}% Supply
        </div>
      </div>
    </div>
  );
}
