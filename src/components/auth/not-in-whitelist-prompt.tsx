// Lock Icon SVG
const LockIcon = () => (
  <svg fill="none" height="32" viewBox="0 0 32 32" width="32">
    <path
      d="M22 12V10C22 6.68629 19.3137 4 16 4C12.6863 4 10 6.68629 10 10V12"
      stroke="#f59e0b"
      strokeLinecap="round"
      strokeWidth="2"
    />
    <rect
      fill="#f59e0b"
      fillOpacity="0.2"
      height="14"
      rx="2"
      stroke="#f59e0b"
      strokeWidth="2"
      width="16"
      x="8"
      y="12"
    />
    <circle cx="16" cy="19" fill="#f59e0b" r="2" />
    <path
      d="M16 21V23"
      stroke="#f59e0b"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

// X Icon for decoration
const XMarkIcon = () => (
  <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
    <path
      d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

export interface NotInWhitelistPromptProps {
  /** Optional message to display */
  message?: string;
  /** Connected wallet address */
  walletAddress?: string;
  /** Callback when user wants to disconnect */
  onDisconnect?: () => void;
}

export function NotInWhitelistPrompt({
  message,
  walletAddress,
  onDisconnect,
}: NotInWhitelistPromptProps) {
  // Truncate address for display
  const displayAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  return (
    <div className="relative w-[416px] bg-[rgba(21,23,30,0.8)] border border-[rgba(245,158,11,0.3)] p-[33px] shadow-[0px_0px_50px_0px_rgba(0,0,0,0.5)]">
      {/* Corner decorations - warning color */}
      <div className="absolute top-[-1px] left-[-1px] w-2 h-2 border-l-2 border-t-2 border-[#f59e0b]" />
      <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-r-2 border-b-2 border-[#f59e0b]" />

      {/* Content */}
      <div className="flex flex-col items-center">
        {/* Lock Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-[#120a02] border border-[#f59e0b]/30 flex items-center justify-center shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
            <LockIcon />
          </div>
        </div>

        {/* Title */}
        <div className="mb-3 text-center">
          <h2 className="font-display text-2xl text-white tracking-[1.65px]">
            Access Restricted
          </h2>
          <p className="text-xs text-[#f59e0b] tracking-[2.4px] uppercase mt-1">
            // Alpha Testing //
          </p>
        </div>

        {/* Info Box */}
        <div className="w-full mb-6 bg-[rgba(245,158,11,0.05)] border-l-2 border-[rgba(245,158,11,0.5)] px-4 py-4">
          <p className="text-sm text-[#fbbf24] leading-normal">
            {message ||
              "You are not on the Alpha testing whitelist and cannot access this feature at this time."}
          </p>
        </div>

        {/* Connected Address */}
        {displayAddress && (
          <div className="w-full mb-6 p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded">
            <div className="flex items-center justify-between">
              <span className="text-xs text-eva-text-dim uppercase tracking-wider">
                Connected Wallet
              </span>
              <span className="text-sm text-eva-text font-mono">
                {displayAddress}
              </span>
            </div>
          </div>
        )}

        {/* Info text */}
        <div className="w-full mb-6 text-center">
          <p className="text-xs text-eva-text-dim leading-relaxed">
            The Alpha testing phase is only available to whitelisted users.
            Please{" "}
            <a
              className="underline"
              href="https://forms.gle/6t1XbFqwe2vZncES8"
              rel="noreferrer"
              target="_blank"
            >
              contact us
            </a>{" "}
            to request access.
          </p>
        </div>

        {/* Disconnect Button */}
        {onDisconnect && (
          <button
            className="w-full h-12 bg-transparent border border-[rgba(255,255,255,0.2)] rounded flex items-center justify-center gap-2 hover:border-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            onClick={onDisconnect}
          >
            <span className="text-eva-text-dim">
              <XMarkIcon />
            </span>
            <span className="text-sm font-semibold text-eva-text-dim uppercase tracking-[1.2px]">
              Disconnect Wallet
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default NotInWhitelistPrompt;
