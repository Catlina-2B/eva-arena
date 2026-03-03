import { useState, useEffect, useCallback, useRef } from "react";
import clsx from "clsx";

export interface TourStep {
  selector: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const NEW_USER_TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="phase-panel"]',
    title: "Live Market",
    description: "This is the arena — watch real-time price action and see agents compete.",
    position: "right",
  },
  {
    selector: '[data-tour="rankings"]',
    title: "Live Rankings",
    description: "Top 3 agents share the prize pool. Create your agent to join the competition.",
    position: "left",
  },
  {
    selector: '[data-tour="create-agent"]',
    title: "Create Your Agent",
    description: "Start here! Pick a strategy, name your agent, and deploy it to the arena.",
    position: "left",
  },
];

export const RETURNING_USER_TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="phase-panel"]',
    title: "Live Market",
    description: "Watch real-time price action. Your agent trades here during the trading phase.",
    position: "right",
  },
  {
    selector: '[data-tour="agent-card"]',
    title: "Your Agent",
    description: "Monitor your agent's balance, PnL, and ranking. Start or pause your agent here.",
    position: "left",
  },
  {
    selector: '[data-tour="teach-me"]',
    title: "Teach Me",
    description: "Adjust your agent's behavior between rounds. Changes take effect next round.",
    position: "left",
  },
  {
    selector: '[data-tour="rankings"]',
    title: "Live Rankings",
    description: "See how your agent compares against competitors. Top 3 share the prize pool.",
    position: "left",
  },
  {
    selector: '[data-tour="activity"]',
    title: "Live Activity",
    description: "Track all trades happening in the arena. Click any agent to inspect their strategy.",
    position: "right",
  },
];

const STORAGE_KEY = "eva_tour_completed";
const STORAGE_KEY_NEW_USER = "eva_tour_new_user_completed";

interface GuidedTourProps {
  isOpen: boolean;
  steps: TourStep[];
  onComplete: () => void;
}

export function GuidedTour({ isOpen, steps, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const rafRef = useRef<number>(0);

  // Reset step index when steps change or tour opens
  useEffect(() => {
    if (isOpen) setCurrentStep(0);
  }, [isOpen, steps]);

  const step = steps[currentStep];

  const positionTooltip = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.selector);
    if (!el) {
      setSpotlightRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setSpotlightRect(rect);

    const gap = 16;
    const pos = step.position ?? "bottom";
    const style: React.CSSProperties = { position: "fixed" };

    if (pos === "right") {
      style.left = rect.right + gap;
      style.top = rect.top + rect.height / 2;
      style.transform = "translateY(-50%)";
    } else if (pos === "left") {
      style.right = window.innerWidth - rect.left + gap;
      style.top = rect.top + rect.height / 2;
      style.transform = "translateY(-50%)";
    } else if (pos === "top") {
      style.left = rect.left + rect.width / 2;
      style.bottom = window.innerHeight - rect.top + gap;
      style.transform = "translateX(-50%)";
    } else {
      style.left = rect.left + rect.width / 2;
      style.top = rect.bottom + gap;
      style.transform = "translateX(-50%)";
    }

    setTooltipStyle(style);
  }, [step]);

  useEffect(() => {
    if (!isOpen || !step) return;

    positionTooltip();
    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(positionTooltip);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, step, positionTooltip]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete();
    }
  }, [currentStep, steps.length, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  if (!isOpen || !step) return null;

  const padding = 8;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left - padding}
                y={spotlightRect.top - padding}
                width={spotlightRect.width + padding * 2}
                height={spotlightRect.height + padding * 2}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.65)"
          mask="url(#tour-mask)"
          style={{ pointerEvents: "auto" }}
          onClick={handleNext}
        />
      </svg>

      {/* Spotlight border ring */}
      {spotlightRect && (
        <div
          className="absolute border-2 border-eva-primary/60 rounded-lg pointer-events-none animate-pulse"
          style={{
            left: spotlightRect.left - padding,
            top: spotlightRect.top - padding,
            width: spotlightRect.width + padding * 2,
            height: spotlightRect.height + padding * 2,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="z-[61] w-72 bg-eva-dark border border-eva-border rounded-xl shadow-2xl p-4 animate-fade-in"
        style={tooltipStyle}
      >
        {/* Step counter */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={clsx(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  i === currentStep ? "bg-eva-primary" : i < currentStep ? "bg-eva-primary/40" : "bg-eva-border"
                )}
              />
            ))}
          </div>
          <span className="text-[10px] text-eva-text-dim font-mono ml-auto">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        <h3 className="text-sm font-bold text-eva-text mb-1">{step.title}</h3>
        <p className="text-xs text-eva-text-dim leading-relaxed mb-4">{step.description}</p>

        <div className="flex items-center justify-between">
          <button
            className="text-[11px] text-eva-text-dim hover:text-eva-text transition-colors"
            onClick={handleSkip}
          >
            Skip tour
          </button>
          <button
            className="px-4 py-1.5 text-xs font-semibold bg-eva-primary text-eva-darker rounded hover:bg-eva-primary-dim transition-colors"
            onClick={handleNext}
          >
            {currentStep < steps.length - 1 ? "Next" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useTourCompleted() {
  const [completed, setCompleted] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const markCompleted = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setCompleted(true);
  }, []);

  return { isTourCompleted: completed, markTourCompleted: markCompleted };
}

export function useNewUserTourCompleted() {
  const [completed, setCompleted] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY_NEW_USER) === "true";
  });

  const markCompleted = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_NEW_USER, "true");
    setCompleted(true);
  }, []);

  return { isNewUserTourCompleted: completed, markNewUserTourCompleted: markCompleted };
}
