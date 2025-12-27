import type { ActivityItem } from "@/types";

import clsx from "clsx";

import {
  EvaCard,
  EvaCardContent,
  DepositBadge,
  WithdrawBadge,
  BuyBadge,
  SellBadge,
} from "@/components/ui";
import { formatTimeAgo } from "@/services/mock";
import { formatSmallNumber } from "@/lib/trench-utils";

interface LiveActivityProps {
  activities: ActivityItem[];
}

export function LiveActivity({ activities }: LiveActivityProps) {

  return (
    <EvaCard>
      <EvaCardContent noPadding>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-t-2 border-t-eva-secondary">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-eva-secondary animate-pulse" />
            <h3 className="text-sm font-semibold tracking-wider uppercase text-eva-text">
              Live Activity
            </h3>
          </div>
        </div>

        {/* Activity list */}
        <div className="max-h-80 overflow-y-auto">
          {activities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))}
        </div>
      </EvaCardContent>
    </EvaCard>
  );
}

interface ActivityRowProps {
  activity: ActivityItem;
}

function getActivityBadge(type: string) {
  switch (type) {
    case "deposit":
      return <DepositBadge />;
    case "withdraw":
      return <WithdrawBadge />;
    case "buy":
      return <BuyBadge />;
    case "sell":
      return <SellBadge />;
    default:
      return <DepositBadge />;
  }
}

function ActivityRow({ activity }: ActivityRowProps) {
  const isDepositOrWithdraw =
    activity.type === "deposit" || activity.type === "withdraw";

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 hover:bg-eva-card-hover transition-colors">
        <div className="flex items-center gap-3">
          {getActivityBadge(activity.type)}
          <div>
            <div className="text-sm text-eva-text">
              {isDepositOrWithdraw ? (
                <span className="font-mono text-eva-primary">
                  {formatSmallNumber(activity.solAmount)} SOL
                </span>
              ) : (
                <>
                  <span className="font-mono">
                    {activity.tokenAmount.toLocaleString()}
                  </span>{" "}
                  Token for{" "}
                  <span className="font-mono text-eva-primary">
                    {formatSmallNumber(activity.solAmount)} SOL
                  </span>
                </>
              )}
            </div>
            {!isDepositOrWithdraw && (
              <div className="text-xs text-eva-text-dim font-mono mt-0.5">
                @{formatSmallNumber(activity.solAmount / activity.tokenAmount)} SOL
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <a className="text-sm text-[#D357E0] hover:underline" href="#">
              {activity.agentName}
            </a>
            <div className="text-xs text-eva-text-dim">
              {formatTimeAgo(activity.timestamp)}
            </div>
          </div>
          {activity.signature && (
            <a
              className="text-eva-text-dim hover:text-eva-text transition-colors"
              href={`https://solscan.io/tx/${activity.signature}?cluster=devnet`}
              rel="noopener noreferrer"
              target="_blank"
              title="View on Solscan"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </>
  );
}
