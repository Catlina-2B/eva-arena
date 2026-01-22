import { Fragment } from "react";
import { createPortal } from "react-dom";

import type { ActivityItem } from "@/types";
import { formatSmallNumber } from "@/lib/trench-utils";

interface ReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityItem | null;
}

function getActionLabel(type: string): string {
  switch (type) {
    case "buy":
      return "Buy";
    case "sell":
      return "Sell";
    case "deposit":
      return "Deposit";
    case "withdraw":
      return "Withdraw";
    default:
      return "Execute";
  }
}

export function ReasoningModal({
  isOpen,
  onClose,
  activity,
}: ReasoningModalProps) {
  if (!isOpen || !activity) return null;

  const actionLabel = getActionLabel(activity.type);
  const isDepositOrWithdraw =
    activity.type === "deposit" || activity.type === "withdraw";
  const actionText = isDepositOrWithdraw
    ? `${actionLabel} ${formatSmallNumber(activity.solAmount)} SOL`
    : `${actionLabel} ${activity.tokenAmount.toLocaleString()} Token for ${formatSmallNumber(activity.solAmount)} SOL @${formatSmallNumber(activity.solAmount)} SOL`;

  // 使用 reason.action 如果存在，否则用默认格式
  const displayAction = activity.reason?.action || actionText;

  return createPortal(
    <Fragment>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-none">
        <div
          aria-modal="true"
          className="bg-eva-darker border border-eva-border rounded-lg shadow-2xl pointer-events-auto animate-slide-up w-full max-w-md"
          role="dialog"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="w-6" /> {/* Spacer for centering */}
            <h2 className="text-base font-bold tracking-[0.1em] uppercase text-eva-text font-mono">
              Reasoning
            </h2>
            <button
              className="p-1 rounded-lg text-eva-text-dim hover:text-eva-text hover:bg-eva-card-hover transition-colors"
              onClick={onClose}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-6">
            {/* Chain of Thought Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-eva-text-dim font-mono">
                Chain of Thought
              </h3>
              <div className="max-h-72 overflow-y-auto pr-2">
                {activity.reason?.content ? (
                  <ol className="space-y-3">
                    {activity.reason.content
                      .split(/\n+|(?<=[.!?])\s{2,}|(?<=[.!?])\s+(?=[A-Z])/)
                      .filter((point) => point.trim().length > 0)
                      .map((point, index, arr) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 p-2 rounded-md bg-eva-dark/30 border-l-2 border-eva-primary/50"
                        >
                          <span className="text-eva-primary text-xs font-bold mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-eva-primary/20 flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm text-eva-text font-mono leading-relaxed">{point.trim()}</span>
                        </li>
                      ))}
                  </ol>
                ) : (
                  <p className="text-sm text-eva-text-dim italic font-mono">No reasoning available</p>
                )}
              </div>
            </div>

            {/* Action Section */}
            <div className="space-y-2 pt-4 border-t border-eva-border">
              <h3 className="text-xs font-medium uppercase tracking-wider text-eva-text-dim font-mono">
                Action
              </h3>
              <div className="bg-black/30 border border-eva-border/50 rounded p-3">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-blue-400 uppercase">EXECUTE</span>
                  <span className="text-eva-text">{displayAction == 'HOLD' ? '--' : displayAction}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>,
    document.body,
  );
}

