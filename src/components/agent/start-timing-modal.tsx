import { Fragment } from "react";

interface StartTimingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTiming: (timing: "now" | "next") => void;
  isLoading?: boolean;
}

// Robot/Agent Icon for the modal
const AgentIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-eva-primary">
    {/* Robot head outline */}
    <rect
      x="6"
      y="10"
      width="20"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Antenna */}
    <line
      x1="16"
      y1="10"
      x2="16"
      y2="6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="16" cy="5" r="1.5" fill="currentColor" />
    {/* Eyes */}
    <rect x="10" y="15" width="4" height="3" rx="0.5" fill="currentColor" />
    <rect x="18" y="15" width="4" height="3" rx="0.5" fill="currentColor" />
    {/* Mouth/Speaker grille */}
    <line
      x1="11"
      y1="22"
      x2="21"
      y2="22"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Close Icon
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Corner decoration component
interface CornerDecorationProps {
  position: "top-left" | "bottom-right";
}

function CornerDecoration({ position }: CornerDecorationProps) {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0 rotate-180",
  }[position];

  return (
    <div
      className={`absolute ${positionClasses} w-4 h-4 pointer-events-none z-20`}
    >
      <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
        <path d="M0 0 L16 0 L16 1 L1 1 L1 16 L0 16 Z" fill="#00ff88" />
      </svg>
    </div>
  );
}

export function StartTimingModal({
  isOpen,
  onClose,
  onSelectTiming,
  isLoading = false,
}: StartTimingModalProps) {
  if (!isOpen) return null;

  const handleSelectNow = () => {
    if (!isLoading) {
      onSelectTiming("now");
    }
  };

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div
          className="relative bg-eva-dark/80 backdrop-blur-md border border-eva-primary/30 pointer-events-auto animate-slide-up w-full max-w-[416px] shadow-[0_0_40px_rgba(108,225,130,0.15)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Corner decorations */}
          <CornerDecoration position="top-left" />
          <CornerDecoration position="bottom-right" />

          {/* Close Button */}
          <button
            type="button"
            className="absolute top-4 right-4 text-[#4b5563] hover:text-white transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            <CloseIcon />
          </button>

          {/* Content */}
          <div className="px-8 pt-10 pb-8 flex flex-col items-center">
            {/* Agent Icon */}
            <div className="w-16 h-16 rounded-full border border-eva-primary/30 bg-eva-dark/60 flex items-center justify-center mb-6">
              <AgentIcon />
            </div>

            {/* Title */}
            <h2 className="font-display text-[22px] text-white tracking-[0.15em] text-center mb-2 uppercase">
              Choose Start
            </h2>
            <h2 className="font-display text-[22px] text-white tracking-[0.15em] text-center mb-3 uppercase">
              Timing
            </h2>

            {/* Secure Channel Label */}
            <div className="text-eva-primary text-xs font-medium tracking-[0.2em] uppercase mb-6">
              // SECURE CHANNEL //
            </div>

            {/* Message Box */}
            <div className="w-full border-l-2 border-[#00FF9D80] bg-[#00FF9D10] px-4 py-3 mb-6">
              <p className="text-sm text-[#00FF9D] leading-relaxed">
                Start immediately or wait for the next round?
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-row gap-3">
              <button
                type="button"
                className="flex-1 h-12 bg-transparent border border-eva-primary text-eva-primary text-xs font-semibold uppercase tracking-[0.15em] hover:bg-eva-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSelectNow}
                disabled={isLoading}
              >
                {isLoading ? "PROCESSING..." : "RIGHT NOW"}
              </button>
              <button
                type="button"
                className="flex-1 h-12 bg-eva-primary text-eva-dark text-xs font-semibold uppercase tracking-[0.15em] hover:bg-eva-primary-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => !isLoading && onSelectTiming("next")}
                disabled={isLoading}
              >
                NEXT ROUND
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

