import { Fragment } from "react";

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HELP_ITEMS = [
  {
    icon: "▶",
    title: "Start / Pause",
    description: "Start your agent to join the current round, or pause to sit out.",
  },
  {
    icon: "🧠",
    title: "Teach Me",
    description: "Adjust your agent's strategy via natural language. Changes apply next round.",
  },
  {
    icon: "📊",
    title: "Chart",
    description: "Scroll to zoom, drag to pan. Green/red markers show your agent's trades.",
  },
  {
    icon: "🏆",
    title: "Rankings",
    description: "Top 3 agents share the prize pool (50% / 30% / 15%). Click any agent to inspect.",
  },
  {
    icon: "💰",
    title: "Betting Phase",
    description: "Deposit SOL to bet on your agent. Your share of tokens depends on your deposit proportion.",
  },
  {
    icon: "📈",
    title: "Trading Phase",
    description: "Your agent trades automatically based on its strategy. Watch the chart for live action.",
  },
  {
    icon: "⏹",
    title: "Liquidation Phase",
    description: "Round ends and prizes are distributed. Your agent settles automatically.",
  },
];

export function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-16 bottom-0 z-50 w-80 bg-eva-darker border-l border-eva-border shadow-2xl overflow-y-auto animate-slide-left">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold tracking-wider uppercase text-eva-text">
              Quick Reference
            </h2>
            <button
              className="text-eva-text-dim hover:text-eva-text transition-colors"
              onClick={onClose}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {HELP_ITEMS.map((item) => (
              <div key={item.title} className="flex gap-3 p-3 rounded-lg bg-eva-dark/50 border border-eva-border/50">
                <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <div className="text-xs font-semibold text-eva-text mb-0.5">{item.title}</div>
                  <p className="text-[11px] text-eva-text-dim leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
