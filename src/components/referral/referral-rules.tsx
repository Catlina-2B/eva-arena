import { useState } from "react";

import type { ReferralTier } from "@/types/api";
import { TierBadge } from "./tier-badge";

const POINTS_RULES = [
  { action: "Referrer bonus on signup", points: "+50" },
  { action: "New user welcome bonus", points: "+50" },
  { action: "Community referral bonus (each)", points: "+10" },
  { action: "Referee completes 1st battle", points: "+50" },
  { action: "Referee completes 10th battle", points: "+50" },
];

const TIERS: {
  tier: ReferralTier;
  range: string;
  perk: string;
}[] = [
  { tier: "NONE", range: "0 – 99 pts", perk: "—" },
  { tier: "SCOUT", range: "100 – 499 pts", perk: "Priority access at mainnet launch" },
  { tier: "AMBASSADOR", range: "500 – 1 999 pts", perk: "5% referee fee share at mainnet" },
  { tier: "CHAMPION", range: "2 000+ pts", perk: "10% referee fee share at mainnet" },
];

export function ReferralRulesToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded border transition-all ${
        open
          ? "text-eva-primary bg-eva-primary/15 border-eva-primary/60 shadow-[0_0_8px_rgba(0,255,136,0.2)]"
          : "text-eva-primary/80 border-eva-primary/40 hover:text-eva-primary hover:border-eva-primary/60 hover:bg-eva-primary/10 hover:shadow-[0_0_6px_rgba(0,255,136,0.15)]"
      }`}
      style={{
        textShadow: open
          ? "0 0 8px rgba(0, 255, 136, 0.6)"
          : "0 0 4px rgba(0, 255, 136, 0.3)",
      }}
    >
      Rules
    </button>
  );
}

export function ReferralRulesPanel() {
  return (
    <div className="rounded-xl bg-eva-card border border-eva-border/20 p-4 space-y-4">
        {/* Points */}
        <section className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-white">
            Earn Points
          </h4>
          <div className="space-y-1.5">
            {POINTS_RULES.map((r) => (
              <div
                key={r.action}
                className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2"
              >
                <span className="text-xs text-eva-text-dim">{r.action}</span>
                <span className="text-xs font-bold text-green-400">
                  {r.points}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2">
              <span className="text-xs text-eva-text-dim">
                Daily cap per referrer
              </span>
              <span className="text-xs font-bold text-eva-primary">
                500 pts
              </span>
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-white">
            Tier System
          </h4>
          <div className="space-y-1.5">
            {TIERS.map((t) => (
              <div
                key={t.tier}
                className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <TierBadge tier={t.tier} size="sm" showIcon={false} />
                  <span className="text-[11px] text-eva-text-dim">
                    {t.range}
                  </span>
                </div>
                <span className="text-[11px] text-eva-text-dim text-right">
                  {t.perk}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Fine print */}
        <section className="space-y-1 text-[11px] text-eva-text-dim leading-relaxed">
          <p>• Each user can only be referred once.</p>
            <p>• Referral points are capped at 500 per day.</p>
          <p>• Fee share is based on your referee's trading fees.</p>
        </section>
      </div>
  );
}

export function ReferralRules() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ReferralRulesToggle open={open} onToggle={() => setOpen((v) => !v)} />
      {open && <ReferralRulesPanel />}
    </>
  );
}
