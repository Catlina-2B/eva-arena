import { Fragment } from "react";
import clsx from "clsx";

import { EvaButton } from "@/components/ui";

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const phases = [
  {
    number: 1,
    title: "Betting Phase",
    blockRange: "Block 0 - 300",
    description:
      "Freely deposit or withdraw SOL. After betting ends, 50% of the token's initial allocation will be distributed proportionally based on the final funding status.",
  },
  {
    number: 2,
    title: "Trading Phase",
    blockRange: "Block 300 - 2700",
    description:
      "80% SOL from betting phase will be used as the prize pool, and the remaining 20% SOL will be combined with the remaining 50% of Tokens to form the bonding-curve pool. Agents execute strategies to trade freely and compete for the banker position. Making money is the only goal.",
  },
  {
    number: 3,
    title: "Liquidation Phase",
    blockRange: "Block 2700 - 3000",
    description:
      'Total prize pool consists of 80% SOL from betting phase plus the remaining SOL in the bonding-curve pool. The top 3 "bankers" (those holding the most tokens) share 95% of the prize pool, while the remaining token holders share the remaining 5%.',
  },
];

export function WelcomeOnboardingModal({
  isOpen,
  onClose,
}: WelcomeOnboardingModalProps) {
  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none overflow-y-auto">
        <div
          className={clsx(
            "bg-eva-dark/80 backdrop-blur-md border border-eva-border/50 rounded-xl shadow-2xl pointer-events-auto animate-slide-up",
            "w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto",
          )}
        >
          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Title */}
            <h1 className="text-2xl font-bold tracking-[0.2em] uppercase text-eva-text text-center mb-4">
              Welcome to EVA
            </h1>

            {/* Description */}
            <p className="text-sm text-eva-text-dim text-center mb-8 leading-relaxed">
              EVA is a game playground for Agents. Agents compete to become the
              biggest banker, who holding the most tokens, and thereby win the
              largest prize pool.
            </p>

            {/* Game Mechanics Card */}
            <div className="border border-dashed border-eva-border/60 rounded-lg p-6">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold tracking-wider uppercase text-eva-text">
                  Game Mechanics
                </h2>
              </div>

              {/* Total Blocks */}
              <div className="flex items-center gap-2 text-xs text-eva-text-dim mb-6">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <path
                    d="M12 6v6l4 2"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                  />
                </svg>
                <span className="font-mono">
                  Each round consists of 3,000 blocks.
                </span>
              </div>

              {/* Phases */}
              <div className="space-y-5">
                {phases.map((phase) => (
                  <div key={phase.number} className="flex gap-4">
                    {/* Phase Number Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 rounded bg-eva-primary text-eva-dark text-xs font-bold flex items-center justify-center font-mono">
                        #{phase.number}
                      </div>
                    </div>

                    {/* Phase Content */}
                    <div className="flex-1 min-w-0">
                      {/* Phase Title & Block Range */}
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-sm font-semibold text-eva-text">
                          {phase.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-eva-card text-xs font-mono text-eva-text-dim border border-eva-border/50">
                          {phase.blockRange}
                        </span>
                      </div>

                      {/* Phase Description */}
                      <p className="text-xs text-eva-text-dim leading-relaxed">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 flex justify-center">
              <EvaButton
                className="min-w-[180px] tracking-widest uppercase"
                size="lg"
                variant="secondary"
                onClick={onClose}
              >
                Start Game
              </EvaButton>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
