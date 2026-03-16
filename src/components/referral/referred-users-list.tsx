import { useQuery } from "@tanstack/react-query";

import { referralApi } from "@/services/api";

export function ReferredUsersList() {
  const { data, isLoading } = useQuery({
    queryKey: ["referral", "referred-users"],
    queryFn: () => referralApi.getReferredUsers(1, 10),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-eva-card border border-eva-border/20 p-5 animate-pulse">
        <div className="h-5 bg-gray-700/50 rounded w-32 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-700/50 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const users = data?.users ?? [];

  return (
    <div className="rounded-xl bg-eva-card border border-eva-border/20 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono uppercase tracking-wider text-eva-text-dim">
          Invited Users
        </h3>
        {data && (
          <span className="text-xs text-eva-text-dim">
            {data.total} total
          </span>
        )}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-6 text-eva-text-dim text-sm">
          No invited users yet. Share your referral link to get started!
        </div>
      ) : (
        <div className="space-y-1.5">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2"
            >
              <span className="font-mono text-xs text-white">
                {user.publicKey.length > 10
                  ? `${user.publicKey.slice(0, 4)}...${user.publicKey.slice(-4)}`
                  : user.publicKey}
              </span>
              <div className="flex items-center gap-2">
                {user.isRetained ? (
                  <StatusPill color="blue" label="Retained" />
                ) : user.isActivated ? (
                  <StatusPill color="green" label="Active" />
                ) : (
                  <StatusPill color="gray" label="Pending" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({
  color,
  label,
}: {
  color: "green" | "gray" | "blue";
  label: string;
}) {
  const colorClasses = {
    green: "bg-green-900/30 text-green-400 border-green-700/30",
    gray: "bg-gray-800/50 text-gray-400 border-gray-600/30",
    blue: "bg-blue-900/30 text-blue-400 border-blue-700/30",
  };

  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase tracking-wider ${colorClasses[color]}`}
    >
      {label}
    </span>
  );
}
