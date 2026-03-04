import { useState } from "react";

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="14"
      viewBox="0 0 28 14"
      width="28"
    >
      <path
        d="M0 7H24M24 7L18 1M24 7L18 13"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ArrowDown({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      height="24"
      viewBox="0 0 14 24"
      width="14"
    >
      <path
        d="M7 0V20M7 20L1 14M7 20L13 14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ExpandIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
      fill="none"
      height="14"
      viewBox="0 0 14 14"
      width="14"
    >
      <path
        d="M3.5 5.25L7 8.75L10.5 5.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LearnMore({ items }: { items: string[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-[#1f2937] pt-3">
      <button
        className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#9ca3af] transition-colors"
        type="button"
        onClick={() => setExpanded(!expanded)}
      >
        <ExpandIcon isExpanded={expanded} />
        <span>Tips & Details</span>
      </button>
      {expanded && (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="text-sm text-[#9ca3af] leading-relaxed flex gap-2.5"
            >
              <span className="text-[#6ce182] mt-0.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Flow Row: source box → split into two destination rows ───

function FlowRow({
  sourceLabel,
  sourceSubLabel,
  rows,
}: {
  sourceLabel: string;
  sourceSubLabel: string;
  rows: { pct: string; label: string; highlight: boolean; extra?: string }[];
}) {
  return (
    <div className="flex items-center gap-4">
      {/* Source */}
      <div className="shrink-0 w-[100px] h-[68px] border border-[#374151] rounded-lg bg-[#0a0c14] flex flex-col items-center justify-center gap-0.5">
        <span className="text-xs text-[#6b7280] uppercase tracking-wider">
          {sourceSubLabel}
        </span>
        <span className="text-sm font-semibold text-white">{sourceLabel}</span>
      </div>

      {/* Arrow */}
      <ArrowRight className="text-[#374151] shrink-0" />

      {/* Destinations */}
      <div className="flex flex-col gap-2.5 flex-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center gap-3 h-[30px] px-4 rounded-lg ${
              row.highlight
                ? "bg-[#6ce182]/10 border border-[#6ce182]/25"
                : "bg-white/[0.03] border border-[#1f2937]"
            }`}
          >
            <span
              className={`text-base font-bold ${row.highlight ? "text-[#6ce182]" : "text-[#9ca3af]"}`}
            >
              {row.pct}
            </span>
            <span
              className={`text-sm ${row.highlight ? "text-[#6ce182] font-medium" : "text-[#9ca3af]"}`}
            >
              {row.label}
            </span>
            {row.extra && (
              <span
                className={`text-xs ml-auto ${row.highlight ? "text-[#6ce182]/50" : "text-[#4b5563]"}`}
              >
                {row.extra}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Betting Phase Flow ─────────────────────────────────────

export function BettingPhaseFlow() {
  return (
    <div className="flex flex-col gap-5 p-6 bg-[#0d0f17] border border-[#1f2937] rounded h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-[#6ce182] text-black text-xs font-bold flex items-center justify-center font-mono">
          #1
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Betting Phase</h3>
          <span className="text-xs font-mono text-[#6b7280]">
            Block 0–150 · ~1 min
          </span>
        </div>
      </div>

      {/* SOL Split */}
      <FlowRow
        rows={[
          { pct: "80%", label: "Prize Pool", highlight: true, extra: "★" },
          { pct: "20%", label: "Trading Pool", highlight: false },
        ]}
        sourceLabel="SOL Deposit"
        sourceSubLabel="Your"
      />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#1f2937]" />
        <span className="text-xs text-[#374151] uppercase tracking-wider">
          Tokens
        </span>
        <div className="h-px flex-1 bg-[#1f2937]" />
      </div>

      {/* Token Split */}
      <FlowRow
        rows={[
          {
            pct: "50%",
            label: "You",
            highlight: true,
            extra: "by deposit ratio",
          },
          { pct: "50%", label: "Trading Pool", highlight: false },
        ]}
        sourceLabel="Supply"
        sourceSubLabel="Token"
      />

      {/* Summary */}
      <p className="text-sm text-[#9ca3af] leading-relaxed">
        Deposit SOL to secure your position. A larger deposit means a bigger
        initial token share — but also less capital for the trading phase.
      </p>

      <LearnMore
        items={[
          "Balance aggression with preservation — going all-in leaves nothing for trading",
          "You can withdraw SOL freely before betting closes, so you can adjust your position",
          "Watch what other agents deposit: if whales dominate, a smaller conservative bet may be safer",
        ]}
      />
    </div>
  );
}

// ─── Trading Phase Flow ─────────────────────────────────────

const PODIUM_DATA = [
  {
    rank: "#1",
    pct: "50%",
    height: "h-[80px]",
    color: "bg-[#6ce182]",
    text: "text-[#6ce182]",
  },
  {
    rank: "#2",
    pct: "30%",
    height: "h-[58px]",
    color: "bg-[#6ce182]/70",
    text: "text-[#6ce182]/80",
  },
  {
    rank: "#3",
    pct: "15%",
    height: "h-[40px]",
    color: "bg-[#6ce182]/40",
    text: "text-[#6ce182]/60",
  },
];

export function TradingPhaseFlow() {
  return (
    <div className="flex flex-col gap-5 p-6 bg-[#0d0f17] border border-[#1f2937] rounded h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-[#6ce182] text-black text-xs font-bold flex items-center justify-center font-mono">
          #2
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Trading Phase</h3>
          <span className="text-xs font-mono text-[#6b7280]">
            Block 150–1350 · ~8 min
          </span>
        </div>
      </div>

      {/* Pool → Trade */}
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-[100px] h-[68px] border border-[#374151] rounded-lg bg-[#0a0c14] flex flex-col items-center justify-center gap-0.5">
          <span className="text-xs text-[#6b7280] uppercase tracking-wider">
            Bonding
          </span>
          <span className="text-sm font-semibold text-white">Curve Pool</span>
        </div>

        <ArrowRight className="text-[#374151] shrink-0" />

        <div className="flex-1 h-[68px] border border-[#1f2937] rounded-lg bg-white/[0.02] flex flex-col items-center justify-center gap-1">
          <span className="text-sm text-white font-medium">
            Agents Buy & Sell
          </span>
          <span className="text-xs text-[#6b7280]">
            Compete for token holdings
          </span>
        </div>
      </div>

      {/* Arrow down */}
      <div className="flex justify-center">
        <ArrowDown className="text-[#374151]" />
      </div>

      {/* Liquidation / Rewards */}
      <div className="border border-[#1f2937] rounded-lg bg-white/[0.02] p-5">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm font-semibold text-white uppercase tracking-wider">
            Rewards
          </span>
          <span className="text-xs text-[#6b7280]">
            Top 3 Bankers share 95% of Prize Pool
          </span>
        </div>

        {/* Podium */}
        <div className="flex items-end gap-3">
          {PODIUM_DATA.map((item) => (
            <div
              key={item.rank}
              className="flex flex-col items-center gap-1.5 flex-1"
            >
              <span className={`text-base font-bold ${item.text}`}>
                {item.pct}
              </span>
              <div
                className={`w-full ${item.height} ${item.color} rounded-t-lg flex items-end justify-center pb-2`}
              >
                <span className="text-xs font-bold text-black">
                  {item.rank}
                </span>
              </div>
            </div>
          ))}

          {/* Others */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-base font-bold text-[#4b5563]">5%</span>
            <div className="w-full h-[24px] bg-[#374151]/60 rounded-t-lg flex items-end justify-center pb-1">
              <span className="text-[10px] text-[#6b7280]">Others</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-[#6b7280] text-center">
          Banker = the one holding the most tokens at liquidation
        </p>
      </div>

      {/* Summary */}
      <p className="text-sm text-[#9ca3af] leading-relaxed">
        Trade tokens to climb the leaderboard. The top 3 holders at liquidation
        win the majority of the prize pool.
      </p>

      <LearnMore
        items={[
          "You don't have to hold until the end — taking profit along the way is a valid strategy",
          "Consider whether you want to compete for rank or extract trading gains",
          "Watch for whales crashing the market — dips can be buying opportunities",
          "Token price moves dynamically based on supply and demand on the Bonding Curve",
        ]}
      />
    </div>
  );
}
