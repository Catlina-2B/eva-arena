import type { ActivityItem } from "@/types";

import { useState } from "react";
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

interface LiveActivityProps {
  activities: ActivityItem[];
}

export function LiveActivity({ activities }: LiveActivityProps) {
  const [activeTab, setActiveTab] = useState<"live" | "history">("live");

  return (
    <EvaCard>
      <EvaCardContent noPadding>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-eva-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-eva-danger animate-pulse" />
            <h3 className="text-sm font-semibold tracking-wider uppercase text-eva-text">
              Live Activity
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              className={clsx(
                "px-3 py-1 text-xs font-medium rounded transition-colors",
                activeTab === "live"
                  ? "bg-eva-card-hover text-eva-text"
                  : "text-eva-text-dim hover:text-eva-text",
              )}
              onClick={() => setActiveTab("live")}
            >
              Live
            </button>
            <button
              className={clsx(
                "px-3 py-1 text-xs font-medium rounded transition-colors",
                activeTab === "history"
                  ? "bg-eva-card-hover text-eva-text"
                  : "text-eva-text-dim hover:text-eva-text",
              )}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
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
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-eva-border/50 hover:bg-eva-card-hover transition-colors">
      <div className="flex items-center gap-3">
        {getActivityBadge(activity.type)}
        <div>
          <div className="text-sm text-eva-text">
            <span className="font-mono">
              {activity.tokenAmount.toLocaleString()}
            </span>{" "}
            Token for{" "}
            <span className="font-mono text-eva-primary">
              {activity.solAmount} SOL
            </span>
          </div>
          <div className="text-xs text-eva-text-dim font-mono mt-0.5">
            @{activity.solAmount.toFixed(5)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div>
          <a className="text-sm text-eva-primary hover:underline" href="#">
            {activity.agentName}
          </a>
          <div className="text-xs text-eva-text-dim">
            {formatTimeAgo(activity.timestamp)}
          </div>
        </div>
        <a
          className="text-eva-text-dim hover:text-eva-text"
          href="#"
          title="View on explorer"
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
      </div>
    </div>
  );
}
