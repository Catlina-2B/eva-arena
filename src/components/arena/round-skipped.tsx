import type { ArenaRound } from "@/types";

import { useSlotSubscription } from "@/hooks/use-slot-subscription";
import { BLOCK_TIMING } from "@/lib/trench-utils";

interface RoundSkippedProps {
  round: ArenaRound;
}

export function RoundSkipped({ round }: RoundSkippedProps) {
  // Subscribe to real-time slot updates
  const { slot } = useSlotSubscription();

  // Calculate countdown based on slot subscription
  // Next round starts at: startBlock + totalBlocks (3000)
  const nextRoundStartSlot = round.startBlock + BLOCK_TIMING.TOTAL_BLOCKS;

  // Calculate remaining time
  let countdown = 0;

  if (slot !== null) {
    const slotsRemaining = Math.max(0, nextRoundStartSlot - slot);

    countdown = Math.ceil((slotsRemaining * BLOCK_TIMING.MS_PER_BLOCK) / 1000);
  } else {
    // Fallback to server-provided value
    countdown = round.nextRoundCountdown || 0;
  }

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  // Progress: how much of the round has elapsed
  const totalRoundSeconds = Math.ceil(
    (BLOCK_TIMING.TOTAL_BLOCKS * BLOCK_TIMING.MS_PER_BLOCK) / 1000,
  );
  const elapsed = totalRoundSeconds - countdown;
  const progress = Math.min(100, (elapsed / totalRoundSeconds) * 100);

  return (
    <div className="relative">
      {/* Main card with subtle border */}
      <div className="relative border border-eva-border/60 overflow-hidden">
        {/* Corner decorations */}
        <CornerDecoration position="top-left" />
        <CornerDecoration position="top-right" />
        <CornerDecoration position="bottom-left" />
        <CornerDecoration position="bottom-right" />

        {/* Background - darker for exception state */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(20, 10, 30, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 py-12 px-8">
          {/* Exception badge */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 border border-amber-500/50"
              style={{ background: "rgba(245, 158, 11, 0.1)" }}
            >
              <svg
                className="text-amber-500"
                fill="none"
                height="16"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="16"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              <span className="font-mono text-xs text-amber-500 tracking-[0.2em] uppercase">
                Round Exception
              </span>
            </div>
          </div>

          {/* Main message */}
          <div className="text-center mb-6">
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Due to no bets being placed during the free
              <br />
              betting phase
            </p>
          </div>

          {/* Skipped message */}
          <div className="text-center mb-8">
            <p className="text-xl md:text-2xl text-white">
              The current round is{" "}
              <span className="underline underline-offset-4 decoration-white/50">
                skipped
              </span>
            </p>
          </div>

          {/* Notice text */}
          <div className="text-center mb-10">
            <p className="font-mono text-xs text-white/30 tracking-[0.15em] uppercase">
              /// NEED TO WAIT FOR THE NEXT ARENA ROUND TO OPEN ///
            </p>
          </div>

          {/* Countdown card with gradient border */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Gradient border effect */}
              <div
                className="absolute -inset-[1px] rounded-sm"
                style={{
                  background:
                    "linear-gradient(135deg, #00ff88 0%, #a855f7 50%, #00ff88 100%)",
                }}
              />

              {/* Card content */}
              <div
                className="relative px-12 py-8 text-center"
                style={{ background: "#0a0a0f" }}
              >
                {/* Label */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <svg
                    className="text-eva-primary"
                    fill="none"
                    height="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="14"
                  >
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span className="font-mono text-xs text-eva-primary tracking-[0.2em] uppercase">
                    NEXT_ROUND_INIT
                  </span>
                </div>

                {/* Timer */}
                <div className="text-5xl font-black text-white tracking-wider mb-4">
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </div>

                {/* Status text */}
                <div className="font-mono text-xs text-white/40 tracking-[0.2em] uppercase mb-4">
                  AWAITING SEQUENCE START
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-white/10 overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${progress}%`,
                      background:
                        "linear-gradient(90deg, #00ff88 0%, #a855f7 100%)",
                    }}
                  />
                </div>
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
