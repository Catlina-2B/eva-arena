import { useState } from "react";

import type { ArenaRound } from "@/types";

import { ShareCardModal } from "./share-card";
import { Fireworks } from "./fireworks";

interface RoundSettlementProps {
  round: ArenaRound;
  currentUserAgent?: {
    rank: number;
    agentName: string;
    agentAvatar?: string;
    prizeAmount: number;
    pnlSol?: number;
  } | null;
}

export function RoundSettlement({
  round,
  currentUserAgent,
}: RoundSettlementProps) {
  const [showShareCard, setShowShareCard] = useState(false);

  const winners = round.winners || [];
  const countdown = round.nextRoundCountdown || 0;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  const top3Winners = winners.filter((w) => w.rank <= 3);
  const top3Total = top3Winners.reduce((sum, w) => sum + w.prizeAmount, 0);
  const othersAmount = Math.max(0, round.totalPrizePool - top3Total);
  const othersPercent =
    round.totalPrizePool > 0
      ? ((othersAmount / round.totalPrizePool) * 100).toFixed(0)
      : "5";

  const getPrizePercent = (rank: number): string => {
    switch (rank) {
      case 1: return "50";
      case 2: return "30";
      case 3: return "15";
      default: return "5";
    }
  };

  // Resolve current user: prefer explicit prop, fall back to winners list
  const currentUserFromWinners = winners.find((w) => w.isCurrentUser);
  const resolvedUser = currentUserAgent ||
    (currentUserFromWinners
      ? {
          rank: currentUserFromWinners.rank,
          agentName: currentUserFromWinners.agentName,
          agentAvatar: currentUserFromWinners.agentAvatar,
          prizeAmount: currentUserFromWinners.prizeAmount,
        }
      : null);

  const isTopThree = resolvedUser ? resolvedUser.rank <= 3 : false;

  return (
    <div className="relative">
      {/* Fireworks overlay for top 3 users */}
      {isTopThree && resolvedUser && (
        <Fireworks rank={resolvedUser.rank} active />
      )}

      {/* Main card */}
      <div
        className="relative border border-[#1f2937] overflow-hidden backdrop-blur-[10px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(16,67,47,0.2) 0%, rgba(10,12,18,0.4) 36%, rgba(22,34,27,0.2) 100%)",
        }}
      >
        <CornerDecoration position="top-left" />
        <CornerDecoration position="top-right" />
        <CornerDecoration position="bottom-left" />
        <CornerDecoration position="bottom-right" />

        {/* Background grid */}
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

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(108,225,130,0.3)] to-transparent" />

        {/* Content */}
        <div
          className="relative z-10 backdrop-blur-[6px] border border-[rgba(255,255,255,0.1)]"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
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
                {round.totalPrizePool.toFixed(2)} SOL
              </span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent my-6" />

            {/* Winners */}
            <div className="mb-6">
              <div className="text-[10px] font-mono font-bold text-[#6b7280] tracking-[0.15em] uppercase mb-3 px-1">
                Winners (Top 3)
              </div>

              <div className="space-y-3">
                {top3Winners.map((winner) => {
                  const isSelf = winner.isCurrentUser;
                  return (
                    <div
                      key={winner.rank}
                      className={`flex items-center justify-between p-[13px] rounded-sm border ${
                        isSelf
                          ? "border-eva-primary bg-eva-primary/10"
                          : "border-[rgba(255,255,255,0.05)]"
                      }`}
                      style={{
                        background: isSelf
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
                        <span
                          className={`font-mono text-sm ${
                            winner.rank === 1
                              ? "text-white"
                              : winner.rank === 2
                                ? "text-[#d1d5db]"
                                : "text-[#9ca3af]"
                          }`}
                        >
                          {winner.agentName}
                        </span>
                        {isSelf && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono text-[#4ade80] bg-[rgba(74,222,128,0.2)] rounded uppercase tracking-wide">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono font-bold text-sm text-[#4ade80]">
                          {winner.prizeAmount.toFixed(2)} SOL
                        </span>
                        <span className="font-mono text-xs text-[#6b7280]">
                          ({getPrizePercent(winner.rank)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Others */}
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="font-mono text-xs text-[#6b7280] pl-8">Others</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono font-bold text-xs text-[#4ade80]">
                      {othersAmount.toFixed(2)} SOL
                    </span>
                    <span className="font-mono text-xs text-[#6b7280]">
                      ({othersPercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent mb-6" />

            {/* Current user result (when not viewing share card) */}
            {resolvedUser && !showShareCard && (
              <div className="mb-6">
                <div
                  className={`flex items-center justify-between p-4 rounded-sm border overflow-hidden relative ${
                    isTopThree
                      ? "border-[rgba(74,222,128,0.3)]"
                      : "border-[rgba(255,255,255,0.1)]"
                  }`}
                  style={{
                    background: isTopThree
                      ? "rgba(74,222,128,0.05)"
                      : "rgba(255,255,255,0.02)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-sm ${isTopThree ? "text-[#4ade80]" : "text-[#9ca3af]"}`}>
                      #{resolvedUser.rank}
                    </span>
                    <span className="font-mono font-bold text-sm text-white tracking-wide">
                      {resolvedUser.agentName}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono text-[#4ade80] bg-[rgba(74,222,128,0.2)] rounded uppercase tracking-wide">
                      You
                    </span>
                  </div>
                  <span className={`font-mono font-bold text-lg ${isTopThree ? "text-[#4ade80]" : "text-white"}`}>
                    {resolvedUser.prizeAmount.toFixed(2)} SOL
                  </span>
                </div>
              </div>
            )}

            {/* Share button */}
            {resolvedUser && (
              <div className="mb-6">
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-sm border border-[rgba(0,255,136,0.3)] bg-[rgba(0,255,136,0.05)] text-[#00ff88] font-mono text-xs uppercase tracking-wider hover:bg-[rgba(0,255,136,0.1)] hover:border-[rgba(0,255,136,0.5)] transition-all active:scale-[0.98]"
                  onClick={() => setShowShareCard(true)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Share Your Results
                </button>
              </div>
            )}

            {/* Share modal */}
            {resolvedUser && (
              <ShareCardModal
                isOpen={showShareCard}
                onClose={() => setShowShareCard(false)}
                round={round}
                currentUser={resolvedUser}
              />
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
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
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
    <div className={`absolute ${positionClasses} w-8 h-8 pointer-events-none z-20`}>
      <svg fill="none" height="32" viewBox="0 0 32 32" width="32">
        <path d="M0 0 L32 0 L32 2 L2 2 L2 32 L0 32 Z" fill="#6ce182" />
      </svg>
    </div>
  );
}
