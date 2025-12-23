import type { ArenaRound } from "@/types";

interface RoundSettlementProps {
  round: ArenaRound;
}

export function RoundSettlement({ round }: RoundSettlementProps) {
  const winners = round.winners || [];
  const countdown = round.nextRoundCountdown || 0;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

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
          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <h2
              className="text-3xl md:text-4xl font-black tracking-[0.15em] uppercase text-center text-white"
              style={{
                textShadow:
                  "0 0 40px rgba(168, 85, 247, 0.8), 0 0 80px rgba(168, 85, 247, 0.4), 0 0 120px rgba(168, 85, 247, 0.2)",
              }}
            >
              Round Settlement
            </h2>
          </div>

          {/* Divider line */}
          <div className="mx-6 border-t border-eva-border" />

          {/* Prize Pool */}
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-white/50 tracking-wider uppercase">
                Final Prize Pool
              </span>
              <span className="text-2xl font-bold text-eva-primary tracking-wider">
                {round.totalPrizePool.toFixed(2)} SOL
              </span>
            </div>
          </div>

          {/* Divider line */}
          <div className="mx-6 border-t border-eva-border" />

          {/* Winners section */}
          <div className="px-8 py-6">
            <div className="text-xs font-mono text-white/40 tracking-[0.2em] uppercase mb-4">
              Winners (TOP 3)
            </div>

            <div className="space-y-3">
              {/* Top 3 winners */}
              {winners
                .filter((w) => w.rank <= 3)
                .map((winner) => (
                  <div
                    key={winner.rank}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white/60">
                        #{winner.rank}
                      </span>
                      <span className="font-mono text-white">
                        {winner.agentName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-eva-secondary">
                        {winner.prize.toFixed(2)} SOL
                      </span>
                      <span className="font-mono text-sm text-white/40">
                        ({winner.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}

              {/* Others (rank 4 entry represents all other participants) */}
              {winners.find((w) => w.agentId === "others") && (
                <div className="flex items-center justify-between pt-2 border-t border-eva-border/30">
                  <span className="font-mono text-white/60">Others</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-eva-secondary">
                      {winners.find((w) => w.agentId === "others")?.prize.toFixed(2)}{" "}
                      SOL
                    </span>
                    <span className="font-mono text-sm text-white/40">
                      ({winners.find((w) => w.agentId === "others")?.percentage}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Next Round Countdown */}
          <div className="px-8 pb-8">
            <div
              className="border border-eva-border/50 p-6 text-center"
              style={{ background: "rgba(255, 255, 255, 0.02)" }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <svg
                  className="text-white/50"
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="font-mono text-xs text-white/50 tracking-[0.2em] uppercase">
                  Next Round
                </span>
              </div>

              <div className="text-5xl font-black text-eva-primary tracking-wider">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </div>

              <div className="font-mono text-xs text-white/30 tracking-[0.3em] uppercase mt-2">
                MIN : SEC
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
