import { startTransition } from "react";
import { useModal } from "@particle-network/connectkit";

// Wallet Icon SVG
const WalletIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 8C4 6.89543 4.89543 6 6 6H26C27.1046 6 28 6.89543 28 8V10H8C6.89543 10 6 10.8954 6 12V24C6 25.1046 6.89543 26 8 26H26C27.1046 26 28 25.1046 28 24V12C28 10.8954 27.1046 10 26 10V8H6V8C5.44772 8 5 7.55228 5 7C5 6.44772 5.44772 6 6 6M22 18C22 19.1046 22.8954 20 24 20C25.1046 20 26 19.1046 26 18C26 16.8954 25.1046 16 24 16C22.8954 16 22 16.8954 22 18Z"
      fill="#6ce182"
    />
  </svg>
);

// Close Icon SVG
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="#6b7280"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Link Icon SVG for button
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7.58333 3.79167L8.75 2.625C9.07082 2.30418 9.5 2.125 9.94792 2.125C10.3958 2.125 10.825 2.30418 11.1458 2.625C11.4667 2.94582 11.6458 3.375 11.6458 3.82292C11.6458 4.27083 11.4667 4.7 11.1458 5.02083L8.8125 7.35417C8.49168 7.67499 8.0625 7.85417 7.61458 7.85417C7.16667 7.85417 6.7375 7.67499 6.41667 7.35417"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.41667 10.2083L5.25 11.375C4.92918 11.6958 4.5 11.875 4.05208 11.875C3.60417 11.875 3.175 11.6958 2.85417 11.375C2.53335 11.0542 2.35417 10.625 2.35417 10.1771C2.35417 9.72917 2.53335 9.3 2.85417 8.97917L5.1875 6.64583C5.50832 6.32501 5.9375 6.14583 6.38542 6.14583C6.83333 6.14583 7.2625 6.32501 7.58333 6.64583"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ConnectWalletPromptProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function ConnectWalletPrompt({
  onClose,
  showCloseButton = false,
}: ConnectWalletPromptProps) {
  const { setOpen } = useModal();

  const handleConnect = () => {
    startTransition(() => {
      setOpen(true);
    });
  };

  return (
    <div className="relative w-[416px] bg-[rgba(21,23,30,0.8)] border border-[rgba(108,225,130,0.3)] p-[33px] shadow-[0px_0px_50px_0px_rgba(0,0,0,0.5)]">
      {/* Corner decorations */}
      <div className="absolute top-[-1px] left-[-1px] w-2 h-2 border-l-2 border-t-2 border-[#6ce182]" />
      <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-r-2 border-b-2 border-[#6ce182]" />

      {/* Close button */}
      {showCloseButton && onClose && (
        <div className="flex justify-end mb-3">
          <button
            className="p-1 text-[#6b7280] hover:text-white transition-colors"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col items-center">
        {/* Wallet Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-[#02120a] border border-[#374151] flex items-center justify-center shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
            <WalletIcon />
          </div>
        </div>

        {/* Title */}
        <div className="mb-3 text-center">
          <h2 className="font-display text-2xl text-white tracking-[1.65px]">
            Welcome to EvA
          </h2>
          <p className="text-xs text-[#008f7a] tracking-[2.4px] uppercase mt-1">
            // Secure Channel //
          </p>
        </div>

        {/* Info Box */}
        <div className="w-full mb-8 bg-[rgba(0,255,157,0.05)] border-l-2 border-[rgba(0,255,157,0.5)] px-4 py-4">
          <p className="text-sm text-[#00ff9d] leading-normal">
            Connect your wallet to enter the arena and create your autonomous
            trading agent.
          </p>
        </div>

        {/* Connect Button */}
        <button
          className="w-full h-12 bg-[#6ce182] border border-[#6ce182] rounded flex items-center justify-center gap-1 hover:bg-[#5bd174] transition-colors"
          onClick={handleConnect}
        >
          <span className="text-black">
            <LinkIcon />
          </span>
          <span className="text-sm font-semibold text-black uppercase tracking-[1.2px]">
            Connect Wallet
          </span>
        </button>
      </div>
    </div>
  );
}

export default ConnectWalletPrompt;

