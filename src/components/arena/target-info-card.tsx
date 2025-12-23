import type { ArenaRound } from "@/types";

import { EvaCard, EvaCardContent } from "@/components/ui";

interface TargetInfoCardProps {
  round: ArenaRound;
}

export function TargetInfoCard({ round }: TargetInfoCardProps) {
  return (
    <EvaCard className="overflow-hidden w-full h-full rounded-r-none lg:border-r-0">
      <EvaCardContent className="flex items-center justify-between gap-6 h-full">
        {/* Left: Token info */}
        <div className="flex items-center gap-4">
          {/* Token Avatar */}
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-eva-secondary/30 to-eva-primary/30 flex items-center justify-center border border-eva-border overflow-hidden">
            <div className="w-12 h-12 rounded bg-eva-secondary/20 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>

          {/* Token Details */}
          <div>
            <div className="text-xs text-eva-primary font-medium uppercase tracking-wider mb-1">
              Target
            </div>
            <div className="text-xl font-bold text-eva-text tracking-wide">
              {round.tokenName}
            </div>
            <div className="text-xs text-eva-text-dim mt-1">
              Market Live. Agents executing high-frequency strategies.
              Synchronization rate stable.
            </div>
          </div>
        </div>

        {/* Right: Prize Pool */}
        <div className="text-right">
          <div className="text-xs text-eva-text-dim uppercase tracking-wider mb-1">
            Total Prize Pool
          </div>
          <div className="text-2xl font-bold text-eva-primary">
            {round.totalPrizePool} SOL
          </div>
        </div>
      </EvaCardContent>
    </EvaCard>
  );
}
