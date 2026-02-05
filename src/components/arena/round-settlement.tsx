import type { ArenaRound } from "@/types";

interface RoundSettlementProps {
  round: ArenaRound;
  /** Current user's agent info for displaying their settlement result */
  currentUserAgent?: {
    rank: number;
    agentName: string;
    prizeAmount: number;
  } | null;
}

export function RoundSettlement({ round, currentUserAgent }: RoundSettlementProps) {
  const winners = round.winners || [];
  const countdown = round.nextRoundCountdown || 0;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  // Top 3 winners
  const top3Winners = winners.filter(w => w.rank <= 3);
  
  // Calculate "Others" prize (remaining 5%)
  const top3Total = top3Winners.reduce((sum, w) => sum + w.prizeAmount, 0);
  const othersAmount = Math.max(0, round.totalPrizePool - top3Total);
  const othersPercent = round.totalPrizePool > 0 
    ? ((othersAmount / round.totalPrizePool) * 100).toFixed(0)
    : "5";

  // Get prize percentage for each winner
  const getPrizePercent = (rank: number): string => {
    switch (rank) {
      case 1: return "50";
      case 2: return "30";
      case 3: return "15";
      default: return "5";
    }
  };

  return (
    <div className="relative">
      {/* Main card with border and corner decorations */}
      <div 
        className="relative border border-[#1f2937] overflow-hidden backdrop-blur-[10px]"
        style={{
          background: "linear-gradient(180deg, rgba(16,67,47,0.2) 0%, rgba(10,12,18,0.4) 36%, rgba(22,34,27,0.2) 100%)",
        }}
      >
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
                linear-gradient(rgba(52, 63, 80, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(52, 63, 80, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        {/* Subtle gradient overlay at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(108,225,130,0.3)] to-transparent" />

        {/* Content */}
        <div 
          className="relative z-10 backdrop-blur-[6px] border border-[rgba(255,255,255,0.1)]"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          {/* Content container */}
          <div className="px-6 pt-6 pb-8 max-w-[470px] mx-auto">
            {/* Header */}
            <div className="pb-4">
              <h2 className="text-lg font-display tracking-[0.09em] uppercase text-center text-white">
                Round Settlement
              </h2>
            </div>

            {/* Prize Pool */}
            <div className="flex flex-col gap-2 px-1 pb-2">
              <span className="font-mono text-sm text-[#9ca3af] tracking-wide">
                Final Prize Pool
              </span>
              <span className="text-2xl font-display text-[#facc15] tracking-tight">
                {round.totalPrizePool.toFixed(2)} USDC
              </span>
            </div>

            {/* Gradient Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent my-6" />

            {/* Winners section */}
            <div className="mb-6">
              <div className="text-[10px] font-mono font-bold text-[#6b7280] tracking-[0.15em] uppercase mb-3 px-1">
                Winners (Top 3)
              </div>

              <div className="space-y-3">
                {/* Top 3 winners */}
                {top3Winners.map((winner) => {
                  const isCurrentUserWinner = winner.isCurrentUser;
                  return (
                  <div
                    key={winner.rank}
                    className={`flex items-center justify-between p-[13px] rounded-sm border ${
                      isCurrentUserWinner 
                        ? "border-eva-primary bg-eva-primary/10" 
                        : "border-[rgba(255,255,255,0.05)]"
                    }`}
                    style={{
                      background: isCurrentUserWinner 
                        ? undefined 
                        : winner.rank === 1 
                          ? "rgba(255,255,255,0.03)" 
                          : winner.rank === 2 
                            ? "rgba(255,255,255,0.02)" 
                            : "rgba(255,255,255,0.01)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#d946ef]">
                        #{winner.rank}
                      </span>
                      <span className={`font-mono text-sm ${
                        winner.rank === 1 ? "text-white" : 
                        winner.rank === 2 ? "text-[#d1d5db]" : 
                        "text-[#9ca3af]"
                      }`}>
                        {winner.agentName}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono font-bold text-sm text-[#4ade80]">
                        {winner.prizeAmount.toFixed(2)} USDC
                      </span>
                      <span className="font-mono text-xs text-[#6b7280]">
                        ({getPrizePercent(winner.rank)}%)
                      </span>
                    </div>
                  </div>
                  );
                })}

                {/* Others row */}
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="font-mono text-xs text-[#6b7280] pl-8">
                    Others
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono font-bold text-xs text-[#4ade80]">
                      {othersAmount.toFixed(2)} USDC
                    </span>
                    <span className="font-mono text-xs text-[#6b7280]">
                      ({othersPercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gradient Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent mb-6" />

            {/* Current user's settlement result */}
            {currentUserAgent && (
              <div className="mb-6">
                <div 
                  className="flex items-center justify-between p-4 rounded-sm border border-[rgba(74,222,128,0.2)] overflow-hidden relative"
                  style={{ background: "rgba(74,222,128,0.05)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[#4ade80]">
                      #{currentUserAgent.rank}
                    </span>
                    <span className="font-mono font-bold text-sm text-white tracking-wide">
                      {currentUserAgent.agentName}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono text-[#4ade80] bg-[rgba(74,222,128,0.2)] rounded uppercase tracking-wide">
                      You
                    </span>
                  </div>
                  <span className="font-mono font-bold text-lg text-[#4ade80]">
                    {currentUserAgent.prizeAmount.toFixed(2)} USDC
                  </span>
                </div>
              </div>
            )}

            {/* Next Round Countdown */}
            <div 
              className="border border-[rgba(255,255,255,0.1)] p-4 text-center backdrop-blur-sm max-w-[280px] mx-auto"
              style={{ background: "rgba(15,15,15,0.9)" }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg
                  className="text-[#9ca3af]"
                  fill="none"
                  height="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="12"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="font-mono text-[10px] text-[#9ca3af] tracking-[0.1em] uppercase">
                  Next Round
                </span>
              </div>

              <div className="text-5xl font-medium font-mono text-[#4ade80] tracking-[-2.4px]">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>

              <div className="font-mono text-[9px] text-[#4b5563] tracking-[0.09em] uppercase mt-1">
                Min : Sec
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

