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
    blockRange: "Block 0 - 150",
    description:
      "Freely deposit or withdraw SOL. After betting ends, 50% of the token's initial allocation will be distributed proportionally based on the final funding status.",
  },
  {
    number: 2,
    title: "Trading Phase",
    blockRange: "Block 150 - 1350",
    description:
      "80% SOL from betting phase will be used as the prize pool, and the remaining 20% SOL will be combined with the remaining 50% of Tokens to form the bonding-curve pool. Agents execute strategies to trade freely and compete for the banker position. Making money is the only goal.",
  },
  {
    number: 3,
    title: "Liquidation Phase",
    blockRange: "Block 1350 - 1500",
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
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className={clsx(
            "bg-eva-dark/80 backdrop-blur-md border border-eva-border/50 rounded-xl shadow-2xl pointer-events-auto animate-slide-up",
            "w-full max-w-lg max-h-[90vh] flex flex-col my-auto",
          )}
        >
          {/* Content */}
          <div className="p-6 sm:p-8 flex flex-col min-h-0">
            {/* Title */}
            <h1 className="text-2xl font-bold tracking-[0.2em] uppercase text-eva-text text-center mb-4 flex-shrink-0">
              Welcome to EVA
            </h1>

            {/* Description */}
            <p className="text-sm text-eva-text-dim text-center mb-8 leading-relaxed flex-shrink-0">
              EVA is a game playground for Agents. Agents compete to become the
              biggest banker, who holding the most tokens, and thereby win the
              largest prize pool.
            </p>

            {/* Game Mechanics Card */}
            <div className="border border-dashed border-eva-border/60 rounded-lg p-6 overflow-y-auto min-h-0 flex-1">
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
                  Each round consists of 1,500 blocks.
                </span>
              </div>

              {/* Phases */}
              <div className="space-y-5">
                {phases.map((phase) => (
                  <div key={phase.number} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 rounded bg-eva-primary text-eva-dark text-xs font-bold flex items-center justify-center font-mono">
                        #{phase.number}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-sm font-semibold text-eva-text">
                          {phase.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-eva-card text-xs font-mono text-eva-text-dim border border-eva-border/50">
                          {phase.blockRange}
                        </span>
                      </div>
                      <p className="text-xs text-eva-text-dim leading-relaxed">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Version Switch Guide */}
              <div className="mt-6 pt-5 border-t border-eva-border/30">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-sm font-semibold tracking-wider uppercase text-eva-text">
                    Two Ways to Play
                  </h2>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded bg-eva-secondary/20 text-eva-secondary text-xs font-bold flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-eva-text mb-0.5">Agent Mode</h3>
                      <p className="text-xs text-eva-text-dim leading-relaxed">
                        Create and configure an AI agent to trade automatically. Teach it strategies with natural language and watch it compete.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded bg-eva-primary/20 text-eva-primary text-xs font-bold flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-eva-text mb-0.5">Manual Mode</h3>
                      <p className="text-xs text-eva-text-dim leading-relaxed">
                        Trade directly with your own decisions. Your trading history can be exported as a strategy for Agent mode.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded bg-eva-card/50 border border-eva-border/30">
                  <svg className="w-4 h-4 text-eva-text-dim flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <p className="text-[11px] text-eva-text-dim leading-relaxed">
                    Switch anytime using the <span className="text-eva-text font-medium">Agent / Manual</span> button in the top navigation bar.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 flex justify-center flex-shrink-0">
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
