import { useState } from "react";

import { ReferralCard } from "./referral-card";
import { ReferralStats } from "./referral-stats";
import { ReferredUsersList } from "./referred-users-list";
import { PointsHistory } from "./points-history";
import { ReferralRulesToggle, ReferralRulesPanel } from "./referral-rules";

interface ReferralDashboardProps {
  onClose?: () => void;
}

export function ReferralDashboard({ onClose }: ReferralDashboardProps) {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-eva-border/10">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-mono uppercase tracking-wider text-white">
            Referral Program
          </h2>
          <ReferralRulesToggle
            open={rulesOpen}
            onToggle={() => setRulesOpen((v) => !v)}
          />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-eva-text-dim hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {rulesOpen && <ReferralRulesPanel />}
        <ReferralCard />
        <ReferralStats />
        <ReferredUsersList />
        <PointsHistory />
      </div>
    </div>
  );
}
