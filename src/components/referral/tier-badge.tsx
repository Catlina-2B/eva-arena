import type { ReferralTier } from "@/types/api";

const TIER_CONFIG: Record<
  ReferralTier,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  NONE: {
    label: "No Tier",
    color: "text-gray-400",
    bgColor: "bg-gray-800/50",
    icon: "—",
  },
  SCOUT: {
    label: "Scout",
    color: "text-amber-600",
    bgColor: "bg-amber-900/20 border border-amber-700/30",
    icon: "🥉",
  },
  AMBASSADOR: {
    label: "Ambassador",
    color: "text-slate-300",
    bgColor: "bg-slate-700/30 border border-slate-500/30",
    icon: "🥈",
  },
  CHAMPION: {
    label: "Champion",
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/20 border border-yellow-600/30",
    icon: "🥇",
  },
};

interface TierBadgeProps {
  tier: ReferralTier;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function TierBadge({ tier, size = "md", showIcon = true }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono uppercase tracking-wider ${config.bgColor} ${config.color} ${sizeClasses[size]}`}
    >
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}
