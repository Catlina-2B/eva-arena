import type { ArenaPhase, ArenaRound } from "@/types";

import clsx from "clsx";

import { EvaCard, EvaCardContent } from "@/components/ui";
import { useSlotSubscription } from "@/hooks/use-slot-subscription";
import { formatDecimal } from "@/lib/trench-utils";

interface ArenaHeaderProps {
  round: ArenaRound;
}

const phaseConfig: Record<
  ArenaPhase,
  { label: string; blocks: [number, number] }
> = {
  betting: { label: "Betting Phase", blocks: [0, 300] },
  trading: { label: "Trading Phase", blocks: [300, 2700] },
  liquidation: { label: "Liquidation Phase", blocks: [2700, 3000] },
};

export function ArenaHeader({ round }: ArenaHeaderProps) {
  // Get current phase config
  const currentPhaseConfig = phaseConfig[round.phase];
  const [phaseStart, phaseEnd] = currentPhaseConfig.blocks;

  // Subscribe to real-time slot updates via WebSocket
  const { slot } = useSlotSubscription();

  // Calculate current block from slot subscription, fallback to round.currentBlock
  const currentBlock =
    slot !== null
      ? Math.min(Math.max(0, slot - round.startBlock), round.totalBlocks)
      : round.currentBlock;

  // Calculate progress percentage based on current phase's start and end blocks
  const phaseBlocks = phaseEnd - phaseStart;
  const currentPhaseProgress = currentBlock - phaseStart;
  const percentage = Math.min(
    100,
    Math.max(0, (currentPhaseProgress / phaseBlocks) * 100),
  );

  return (
    <EvaCard className="overflow-hidden">
      <EvaCardContent className="flex flex-col lg:flex-row items-stretch">
        {/* Left: Target Info */}
        <div className="flex items-center justify-between gap-6 flex-1 lg:flex-[2] pb-4 lg:pb-0 lg:pr-6 lg:border-r border-b lg:border-b-0 border-eva-border">
          <div className="flex items-center gap-4">
            {/* Token Avatar */}
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-eva-secondary/30 to-eva-primary/30 flex items-center justify-center border border-eva-border overflow-hidden">
              <div className="w-12 h-12 rounded bg-eva-secondary/20 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>

            {/* Token Details */}
            <div>
              <div className="text-xs text-eva-secondary font-medium uppercase tracking-wider mb-1">
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

          {/* Prize Pool */}
          <div className="text-right">
            <div className="text-xs text-eva-text-dim uppercase tracking-wider mb-1">
              Total Prize Pool
            </div>
            <div className="text-2xl font-bold text-eva-primary whitespace-nowrap">
              {formatDecimal(round.totalPrizePool)} SOL
            </div>
          </div>
        </div>

        {/* Right: Phase Progress */}
        <div className="flex-1 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-center gap-2">
          {/* Block counter - left aligned with border */}
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-eva-border rounded">
              <span className="text-eva-text-dim text-sm">⏱</span>
              <span className="text-xs font-mono text-eva-text-dim">
                BLOCK {currentBlock.toLocaleString()} /{" "}
                {round.totalBlocks.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Current phase label - left aligned */}
          <div className="flex items-center justify-start">
            <span className="text-xs uppercase tracking-wider font-medium text-eva-text">
              {currentPhaseConfig.label}
            </span>
          </div>

          {/* Segmented progress bar */}
          <div className="border border-eva-primary p-1">
            <div className="flex gap-1">
              {Array.from({ length: 12 }).map((_, i) => {
                const segmentProgress = ((i + 1) / 12) * 100;
                const isFilled = percentage >= segmentProgress - 100 / 12 / 2;

                return (
                  <div
                    key={i}
                    className={clsx(
                      "flex-1 h-1.5 transition-colors",
                      isFilled ? "bg-eva-primary" : "bg-eva-border/50",
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </EvaCardContent>
    </EvaCard>
  );
}
