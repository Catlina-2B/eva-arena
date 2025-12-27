import { Fragment } from "react";

interface FirstDepositPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: () => void;
  onSkip: () => void;
}

// Terminal/Command Line Icon for the modal
const TerminalIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    className="text-eva-primary"
  >
    {/* Terminal window */}
    <rect
      x="4"
      y="6"
      width="24"
      height="20"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Prompt arrow > */}
    <path
      d="M9 16L13 20M9 16L13 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Cursor underscore _ */}
    <line
      x1="16"
      y1="20"
      x2="22"
      y2="20"
      stroke="currentColor"
      strokeWidth="2"
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

// Download/Deposit Arrow Icon
const DepositArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="inline-block mr-2"
  >
    <path
      d="M8 3V13M8 13L4 9M8 13L12 9"
      stroke="currentColor"
      strokeWidth="2"
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

export function FirstDepositPromptModal({
  isOpen,
  onClose,
  onDeposit,
  onSkip,
}: FirstDepositPromptModalProps) {
  if (!isOpen) return null;

  const handleDeposit = () => {
    onDeposit();
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
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
            onClick={handleClose}
          >
            <CloseIcon />
          </button>

          {/* Content */}
          <div className="px-8 pt-10 pb-8 flex flex-col items-center">
            {/* Terminal Icon */}
            <div className="w-16 h-16 rounded-lg border border-eva-primary/30 bg-eva-dark/60 flex items-center justify-center mb-6">
              <TerminalIcon />
            </div>

            {/* Title */}
            <h2 className="font-display text-[22px] text-white tracking-[0.25em] text-center mb-4 uppercase">
              WELLCOME
            </h2>

            {/* Subtitle */}
            <h3 className="font-display text-lg text-white tracking-[0.2em] text-center mb-3 uppercase">
              DEPOSIT FUND
            </h3>

            {/* Description */}
            <p className="text-sm text-eva-text-dim text-center mb-8 tracking-wide">
              Let's deposit SOL to your wallet to play!
            </p>

            {/* Deposit Button */}
            <button
              type="button"
              className="w-full h-12 bg-eva-primary text-eva-dark text-sm font-semibold uppercase tracking-[0.15em] hover:bg-eva-primary/90 transition-all flex items-center justify-center"
              onClick={handleDeposit}
            >
              <DepositArrowIcon />
              DEPOSIT
            </button>

            {/* Skip Link */}
            <button
              type="button"
              className="mt-6 text-eva-text-dim text-xs tracking-[0.15em] uppercase hover:text-white transition-colors font-mono"
              onClick={handleSkip}
            >
              [ SKIP FOR LATER ]
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

