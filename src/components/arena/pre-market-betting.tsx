import type { ArenaRound } from "@/types";

import { EvaBadge } from "@/components/ui";
import { formatDecimal, formatPrice } from "@/lib/trench-utils";

interface PreMarketBettingProps {
  round: ArenaRound;
}

export function PreMarketBetting({ round }: PreMarketBettingProps) {
  return (
    <div className="relative">
      {/* Main card with subtle border */}
      <div className="relative border border-eva-border/60 overflow-hidden">
        {/* Corner decorations */}
        <CornerDecoration position="top-left" />
        <CornerDecoration position="top-right" />
        <CornerDecoration position="bottom-left" />
        <CornerDecoration position="bottom-right" />

        {/* Background grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header with purple glow */}
          <div className="px-8 pt-8 pb-6">
            <h2
              className="text-3xl md:text-4xl font-black tracking-[0.15em] uppercase text-center text-white"
              style={{
                textShadow:
                  "0 0 40px rgba(168, 85, 247, 0.8), 0 0 80px rgba(168, 85, 247, 0.4), 0 0 120px rgba(168, 85, 247, 0.2)",
              }}
            >
              Pre-Market Betting
            </h2>
          </div>

          {/* Divider line */}
          <div className="mx-6 border-t border-eva-border" />

          {/* Status message section */}
          <div className="px-6 py-5">
            <div className="bg-eva-primary/5 border border-eva-border/50 border-l-2 border-l-eva-primary p-4 relative">
              {/* Badge in top right */}
              <div className="absolute -top-1 right-0">
                <EvaBadge
                  className="font-mono text-[10px] tracking-wider rounded-none"
                  size="sm"
                  variant="primary"
                >
                  SYS_MSG_01
                </EvaBadge>
              </div>

              <div className="pr-28">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-eva-primary font-mono text-sm">
                    &gt;_
                  </span>
                  <span className="text-sm font-mono font-medium text-eva-primary tracking-[0.15em] uppercase">
                    AT FIELD STATUS:
                  </span>
                </div>
                <p className="text-sm text-eva-text-dim leading-relaxed font-mono">
                  The trading market is not yet open. Deposit SOL into your
                  account, and let your agent strategy control the deposits or
                  withdrawals to ensure you receive the initial allocation of{" "}
                  {round.tokenName}.
                </p>
              </div>
            </div>
          </div>

          {/* Allocation stats */}
          <div className="px-6 pb-6">
            <div
              className="overflow-hidden"
              style={{
                background: "#D357E01A",
                border: "1px solid rgba(211, 87, 224, 0.3)",
              }}
            >
              <div className="grid grid-cols-3 divide-x divide-white/10">
                <AllocationStat
                  label="Token Alloc"
                  labelColor="text-eva-secondary"
                  value={round.tokenAlloc}
                />
                <AllocationStat
                  label="LP Alloc"
                  labelColor="text-eva-secondary"
                  value={round.lpAlloc}
                />
                <AllocationStat
                  label="Prize Fund"
                  labelColor="text-eva-secondary"
                  value={round.prizeFund}
                />
              </div>
            </div>
          </div>

          {/* Current Pool */}
          <div className="px-6 pb-8">
            <h3 className="text-lg font-bold tracking-[0.2em] uppercase text-center text-white mb-5">
              Current Pool
            </h3>

            <div
              className="border border-eva-border overflow-hidden"
              style={{ background: "#FFFFFF0D" }}
            >
              <div className="grid grid-cols-3 divide-x divide-eva-border">
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
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0 rotate-90",
    "bottom-left": "bottom-0 left-0 -rotate-90",
    "bottom-right": "bottom-0 right-0 rotate-180",
  }[position];

  return (
    <div
      className={`absolute ${positionClasses} w-8 h-8 pointer-events-none z-20`}
    >
      <svg fill="none" height="32" viewBox="0 0 32 32" width="32">
        <path d="M0 0 L32 0 L32 2 L2 2 L2 32 L0 32 Z" fill="#00ff88" />
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
        className={`text-[11px] uppercase tracking-[0.2em] mb-2 font-mono font-semibold ${labelColor}`}
      >
        {label}
      </div>
      <div className="flex items-baseline justify-center gap-0.5">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-base font-bold text-white/40">%</span>
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
      <div className="text-[10px] text-eva-text-dim uppercase tracking-[0.2em] mb-2 font-mono">
        {label}
      </div>
      <div className="text-2xl font-bold text-white tracking-wider">
        {value}
      </div>
    </div>
  );
}
