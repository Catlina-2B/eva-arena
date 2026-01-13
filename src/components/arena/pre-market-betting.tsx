import type { ArenaRound } from "@/types";

import { formatDecimal, formatPrice } from "@/lib/trench-utils";

interface PreMarketBettingProps {
  round: ArenaRound;
}

export function PreMarketBetting({ round }: PreMarketBettingProps) {
  return (
    <div className="relative">
      {/* Main card with subtle border and bracket hover effect */}
      <div className="relative border border-eva-border/60 overflow-hidden bracket-container">
        {/* Corner decorations */}
        <CornerDecoration position="top-left" />
        <CornerDecoration position="top-right" />
        <CornerDecoration position="bottom-left" />
        <CornerDecoration position="bottom-right" />

        {/* Background grid pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(108, 225, 130, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(108, 225, 130, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        {/* Subtle gradient overlay at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(108,225,130,0.3)] to-transparent" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-2xl md:text-3xl font-display tracking-[0.12em] uppercase text-center text-white">
              Betting Phase
            </h2>
          </div>

          {/* Description message */}
          <div className="px-6 pb-6">
            <div className="border-l-2 border-l-eva-primary pl-4 py-1">
              <p className="text-sm text-[#9ca3af] leading-relaxed font-mono">
                We're currently in the Token Betting Phase. By setting up your Agent prompt, you can compete for up to 50% of the initial token allocation. Final distribution is calculated proportionally based on each agent's end-of-round funding results.
              </p>
            </div>
          </div>

          {/* Allocation sections */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-4">
              {/* TOKEN ALLOC */}
              <div>
                <div className="text-[10px] font-mono font-bold text-[#9ca3af] tracking-[0.15em] uppercase mb-3">
                  Token Alloc
                </div>
                <div 
                  className="grid grid-cols-2 divide-x divide-[rgba(255,255,255,0.1)] overflow-hidden"
                  style={{
                    background: "rgba(211, 87, 224, 0.1)",
                    border: "1px solid rgba(211, 87, 224, 0.2)",
                  }}
                >
                  <AllocationStat
                    label="Betting Phase"
                    value={50}
                    labelColor="text-[#d946ef]"
                  />
                  <AllocationStat
                    label="Trading Phase"
                    value={50}
                    labelColor="text-[#d946ef]"
                  />
                </div>
              </div>

              {/* FOUNDING ALLOC */}
              <div>
                <div className="text-[10px] font-mono font-bold text-[#9ca3af] tracking-[0.15em] uppercase mb-3">
                  Founding Alloc
                </div>
                <div 
                  className="grid grid-cols-2 divide-x divide-[rgba(255,255,255,0.1)] overflow-hidden"
                  style={{
                    background: "rgba(211, 87, 224, 0.1)",
                    border: "1px solid rgba(211, 87, 224, 0.2)",
                  }}
                >
                  <AllocationStat
                    label="Bonding Curve"
                    value={round.lpAlloc}
                    labelColor="text-[#d946ef]"
                  />
                  <AllocationStat
                    label="Prize Pool"
                    value={round.prizeFund}
                    labelColor="text-[#d946ef]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Current Pool */}
          <div className="px-6 pb-8">
            <div className="text-[10px] font-mono font-bold text-[#9ca3af] tracking-[0.15em] uppercase mb-3">
              Current Pool
            </div>

            <div
              className="overflow-hidden"
              style={{ 
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.1)]">
                <PoolStat
                  label="Total Pool"
                  value={formatDecimal(round.totalSol)}
                />
                <PoolStat
                  label="Token Price"
                  value={formatPrice(round.totalSol / 5e8)}
                />
                <PoolStat
                  label="Active Agents"
                  value={round.activeAgents.toString()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Corner decoration component
interface CornerDecorationProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

function CornerDecoration({ position }: CornerDecorationProps) {
  const positionClasses = {
    "top-left": "top-[-1px] left-[-1px]",
    "top-right": "top-[-1px] right-[-1px] rotate-90",
    "bottom-left": "bottom-[-1px] left-[-1px] -rotate-90",
    "bottom-right": "bottom-[-1px] right-[-1px] rotate-180",
  }[position];

  return (
    <div
      className={`absolute ${positionClasses} w-8 h-8 pointer-events-none z-20`}
    >
      <svg fill="none" height="32" viewBox="0 0 32 32" width="32">
        <path d="M0 0 L32 0 L32 2 L2 2 L2 32 L0 32 Z" fill="#6ce182" />
      </svg>
    </div>
  );
}

interface AllocationStatProps {
  label: string;
  value: number;
  labelColor: string;
}

function AllocationStat({ label, value, labelColor }: AllocationStatProps) {
  return (
    <div className="px-4 py-4 text-center">
      <div
        className={`text-[10px] uppercase tracking-[0.1em] mb-2 font-mono font-medium ${labelColor}`}
      >
        {label}
      </div>
      <div className="flex items-baseline justify-center gap-0.5">
        <span className="text-3xl font-medium text-white">{value}</span>
        <span className="text-lg font-medium text-[#6b7280]">%</span>
      </div>
    </div>
  );
}

interface PoolStatProps {
  label: string;
  value: string;
}

function PoolStat({ label, value }: PoolStatProps) {
  return (
    <div className="px-4 py-4 text-center">
      <div className="text-[10px] text-[#9ca3af] uppercase tracking-[0.15em] mb-2 font-mono">
        {label}
      </div>
      <div className="text-2xl font-medium text-white tracking-wide">
        {value}
      </div>
    </div>
  );
}
