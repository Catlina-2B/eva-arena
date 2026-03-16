import { useQuery } from "@tanstack/react-query";

import { referralApi } from "@/services/api";

const TYPE_LABELS: Record<string, string> = {
  REFERRAL_REGISTER: "Referral Signup",
  REFERRAL_ACTIVATED: "Referral Activated",
  REFERRAL_RETAINED: "Referral Retained",
  COMMUNITY_BONUS: "Community Bonus",
};

export function PointsHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ["referral", "points-history"],
    queryFn: () => referralApi.getPointsHistory(1, 10),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-eva-card border border-eva-border/20 p-5 animate-pulse">
        <div className="h-5 bg-gray-700/50 rounded w-32 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-700/50 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="rounded-xl bg-eva-card border border-eva-border/20 p-5 space-y-3">
      <h3 className="text-sm font-mono uppercase tracking-wider text-eva-text-dim">
        Points History
      </h3>

      {items.length === 0 ? (
        <div className="text-center py-6 text-eva-text-dim text-sm">
          No points earned yet.
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2"
            >
              <div>
                <div className="text-xs text-white">
                  {TYPE_LABELS[item.type] ?? item.type}
                </div>
                <div className="text-[10px] text-eva-text-dim">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className="text-sm font-bold text-green-400">
                +{item.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
