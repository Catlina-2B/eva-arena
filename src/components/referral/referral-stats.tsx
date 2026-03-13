import { useQuery } from "@tanstack/react-query";

import { referralApi } from "@/services/api";
import { TierBadge } from "./tier-badge";

const TIER_THRESHOLDS = [
  { tier: "SCOUT" as const, min: 100, label: "Scout" },
  { tier: "AMBASSADOR" as const, min: 500, label: "Ambassador" },
  { tier: "CHAMPION" as const, min: 2000, label: "Champion" },
];

export function ReferralStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["referral", "stats"],
    queryFn: referralApi.getStats,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-eva-card border border-eva-border/20 p-5 animate-pulse">
        <div className="h-5 bg-gray-700/50 rounded w-40 mb-4" />
        <div className="space-y-3">
          <div className="h-8 bg-gray-700/50 rounded" />
          <div className="h-8 bg-gray-700/50 rounded" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const nextTier = TIER_THRESHOLDS.find((t) => stats.totalPoints < t.min);
  const progressToNext = nextTier
    ? Math.min(100, (stats.totalPoints / nextTier.min) * 100)
    : 100;

  return (
    <div className="rounded-xl bg-eva-card border border-eva-border/20 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono uppercase tracking-wider text-eva-text-dim">
          Referral Stats
        </h3>
        <TierBadge tier={stats.tier} size="sm" />
      </div>

      {/* Points & Progress */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-white">
            {stats.totalPoints}
          </span>
          {nextTier && (
            <span className="text-xs text-eva-text-dim">
              {nextTier.min - stats.totalPoints} pts to {nextTier.label}
            </span>
          )}
        </div>
        <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-eva-primary rounded-full transition-all duration-500"
            style={{ width: `${progressToNext}%` }}
          />
        </div>
      </div>

      {/* Detail Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatItem label="Invited" value={stats.referredCount} />
        <StatItem label="Activated" value={stats.activatedCount} />
        <StatItem label="Retained" value={stats.retainedCount} />
        <StatItem
          label="Daily Pts"
          value={stats.dailyReferralPoints}
          suffix="/500"
        />
      </div>

      {stats.feeSharePct > 0 && (
        <div className="bg-eva-primary/10 border border-eva-primary/20 rounded-lg p-3 text-center">
          <span className="text-xs text-eva-text-dim">Fee Share:</span>{" "}
          <span className="text-sm font-bold text-eva-primary">
            {stats.feeSharePct}%
          </span>
        </div>
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="bg-black/20 rounded-lg p-3">
      <div className="text-xs text-eva-text-dim uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-base font-bold text-white">
        {value}
        {suffix && (
          <span className="text-xs text-eva-text-dim font-normal">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
