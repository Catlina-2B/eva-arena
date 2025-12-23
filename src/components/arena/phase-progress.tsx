import type { ArenaPhase, ArenaRound } from "@/types";

import clsx from "clsx";

import { EvaCard, EvaCardContent } from "@/components/ui";

interface PhaseProgressProps {
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

export function PhaseProgress({ round }: PhaseProgressProps) {
  const percentage = (round.currentBlock / round.totalBlocks) * 100;

  const getPhaseStatus = (phase: ArenaPhase) => {
    const current = round.phase;
    const phases: ArenaPhase[] = ["betting", "trading", "liquidation"];
    const currentIndex = phases.indexOf(current);
    const phaseIndex = phases.indexOf(phase);

    if (phaseIndex < currentIndex) return "completed";
    if (phaseIndex === currentIndex) return "active";

    return "pending";
  };

  return (
    <EvaCard className="w-full h-full rounded-l-none lg:rounded-l-none">
      <EvaCardContent className="py-3 h-full flex flex-col justify-center">
        <div className="flex items-center justify-between mb-3">
          {/* Block counter */}
          <div className="flex items-center gap-2">
            <span className="text-eva-text-dim">⏱</span>
            <span className="text-sm font-mono text-eva-text">
              BLOCK {round.currentBlock.toLocaleString()} /{" "}
              {round.totalBlocks.toLocaleString()}
            </span>
          </div>

          {/* Phase labels */}
          <div className="flex items-center gap-6">
            {(["trading", "liquidation"] as ArenaPhase[]).map((phase) => {
              const status = getPhaseStatus(phase);

              return (
                <span
                  key={phase}
                  className={clsx(
                    "text-xs uppercase tracking-wider font-medium",
                    status === "active" && "text-eva-primary",
                    status === "completed" && "text-eva-success",
                    status === "pending" && "text-eva-text-dim",
                  )}
                >
                  {phaseConfig[phase].label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-2 bg-eva-darker rounded-full overflow-hidden">
          {/* Phase dividers */}
          <div
            className="absolute top-0 bottom-0 w-px bg-eva-border"
            style={{ left: "10%" }} // 300/3000
          />
          <div
            className="absolute top-0 bottom-0 w-px bg-eva-border"
            style={{ left: "90%" }} // 2700/3000
          />

          {/* Segments background */}
          <div className="absolute inset-0 flex">
            <div className="w-[10%] bg-eva-primary/10" />
            <div className="w-[80%] bg-eva-accent/10" />
            <div className="w-[10%] bg-eva-secondary/10" />
          </div>

          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-eva-primary to-eva-accent rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </EvaCardContent>
    </EvaCard>
  );
}
