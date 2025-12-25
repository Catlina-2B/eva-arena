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
import { formatSmallNumber } from "@/lib/trench-utils";
import { ReasoningModal } from "./reasoning-modal";

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
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  return (
    <>
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
                {formatSmallNumber(activity.solAmount)} SOL
              </span>
            </div>
            <div className="text-xs text-eva-text-dim font-mono mt-0.5">
              @{formatSmallNumber(activity.solAmount)}
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
          <button
            className="text-eva-text-dim hover:text-eva-text transition-colors"
            title="View reasoning"
            onClick={() => setIsReasoningOpen(true)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>
      </div>

      <ReasoningModal
        activity={activity}
        isOpen={isReasoningOpen}
        onClose={() => setIsReasoningOpen(false)}
      />
    </>
  );
}
