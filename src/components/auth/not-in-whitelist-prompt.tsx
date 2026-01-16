import { useAuthStore } from "@/stores/auth";

// Lock Icon SVG
const LockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path
      d="M22 12V10C22 6.68629 19.3137 4 16 4C12.6863 4 10 6.68629 10 10V12"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect
      x="8"
      y="12"
      width="16"
      height="14"
      rx="2"
      fill="#f59e0b"
      fillOpacity="0.2"
      stroke="#f59e0b"
      strokeWidth="2"
    />
    <circle cx="16" cy="19" r="2" fill="#f59e0b" />
    <path
      d="M16 21V23"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// X Icon for decoration
const XMarkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface NotInWhitelistPromptProps {
  /** Optional message to display */
  message?: string;
}

export function NotInWhitelistPrompt({
  message,
}: NotInWhitelistPromptProps) {
  const { logout, user } = useAuthStore();

  // Truncate address for display
  const displayAddress = user?.publicKey
    ? `${user.publicKey.slice(0, 6)}...${user.publicKey.slice(-4)}`
    : "";

  const handleDisconnect = () => {
    logout();
  };

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
            {message || "您当前不在 Alpha 测试白名单内，暂时无法访问此功能。"}
          </p>
        </div>

        {/* Connected Address */}
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

        {/* Info text */}
        <div className="w-full mb-6 text-center">
          <p className="text-xs text-eva-text-dim leading-relaxed">
            Alpha 测试阶段仅对白名单用户开放。如需获取访问权限，请联系官方获取邀请。
          </p>
        </div>

        {/* Disconnect Button */}
        <button
          className="w-full h-12 bg-transparent border border-[rgba(255,255,255,0.2)] rounded flex items-center justify-center gap-2 hover:border-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          onClick={handleDisconnect}
        >
          <span className="text-eva-text-dim">
            <XMarkIcon />
          </span>
          <span className="text-sm font-semibold text-eva-text-dim uppercase tracking-[1.2px]">
            Disconnect Wallet
          </span>
        </button>
      </div>
    </div>
  );
}

export default NotInWhitelistPrompt;
