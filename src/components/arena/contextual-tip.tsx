import { useState, useEffect, useCallback } from "react";

const TIP_PREFIX = "eva_tip_shown_";

export type TipId = "evolve_after_round" | "retry_after_loss" | "compare_after_win";

interface TipConfig {
  id: TipId;
  message: string;
  cta?: string;
}

const TIPS: Record<TipId, TipConfig> = {
  evolve_after_round: {
    id: "evolve_after_round",
    message: "Want different results? Use Teach Me to adjust your agent's behavior.",
    cta: "Try Teach Me",
  },
  retry_after_loss: {
    id: "retry_after_loss",
    message: "Try tweaking one instruction — small changes can shift outcomes.",
    cta: "Modify Strategy",
  },
  compare_after_win: {
    id: "compare_after_win",
    message: "Nice win! Check the leaderboard to see how others played.",
  },
};

function wasTipShown(id: TipId): boolean {
  try {
    return localStorage.getItem(TIP_PREFIX + id) === "1";
  } catch {
    return false;
  }
}

function markTipShown(id: TipId) {
  try {
    localStorage.setItem(TIP_PREFIX + id, "1");
  } catch { /* noop */ }
}

interface ContextualTipProps {
  tipId: TipId | null;
  onAction?: () => void;
}

export function ContextualTip({ tipId, onAction }: ContextualTipProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!tipId || wasTipShown(tipId)) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [tipId]);

  useEffect(() => {
    if (!visible || !tipId) return;
    const autoHide = setTimeout(() => {
      markTipShown(tipId);
      setDismissed(true);
    }, 12000);
    return () => clearTimeout(autoHide);
  }, [visible, tipId]);

  const handleDismiss = useCallback(() => {
    if (tipId) markTipShown(tipId);
    setDismissed(true);
  }, [tipId]);

  const handleAction = useCallback(() => {
    if (tipId) markTipShown(tipId);
    setDismissed(true);
    onAction?.();
  }, [tipId, onAction]);

  if (!tipId || !visible || dismissed) return null;

  const tip = TIPS[tipId];
  if (!tip) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-3 px-5 py-3 bg-eva-dark/95 backdrop-blur-md border border-eva-primary/30 rounded-xl shadow-2xl max-w-md">
        <span className="text-eva-primary text-lg flex-shrink-0">💡</span>
        <p className="text-xs text-eva-text leading-relaxed flex-1">{tip.message}</p>
        {tip.cta && onAction && (
          <button
            className="flex-shrink-0 px-3 py-1 text-[11px] font-semibold text-eva-darker bg-eva-primary rounded hover:bg-eva-primary-dim transition-colors"
            onClick={handleAction}
          >
            {tip.cta}
          </button>
        )}
        <button
          className="flex-shrink-0 text-eva-text-dim hover:text-eva-text transition-colors"
          onClick={handleDismiss}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
