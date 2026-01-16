import { type ReactNode } from "react";

import { useAuthStore } from "@/stores/auth";
import { useWhitelistCheck } from "@/hooks/use-whitelist-check";

import { ConnectWalletPrompt } from "@/components/wallet";
import { NotInWhitelistPrompt } from "./not-in-whitelist-prompt";

export interface AlphaGuardProps {
  children: ReactNode;
  /** Whether to check whitelist (default: true) */
  requireWhitelist?: boolean;
  /** Custom message for non-whitelisted users */
  whitelistMessage?: string;
}

/**
 * Alpha Guard component that protects routes requiring:
 * 1. Wallet connection and authentication
 * 2. Alpha whitelist access
 *
 * Shows appropriate UI for each state:
 * - Not connected: Shows connect wallet prompt
 * - Connected but not whitelisted: Shows access restricted message
 * - Connected and whitelisted: Shows children
 */
export function AlphaGuard({
  children,
  requireWhitelist = true,
  whitelistMessage,
}: AlphaGuardProps) {
  const { isAuthenticated } = useAuthStore();

  // Check whitelist status (only when authenticated and whitelist is required)
  const { isWhitelisted, isLoading: isWhitelistLoading } = useWhitelistCheck({
    enabled: requireWhitelist && isAuthenticated,
  });

  // Not authenticated - show connect wallet prompt
  if (!isAuthenticated) {
    return (
      <div className="relative flex flex-col min-h-screen bg-eva-dark">
        {/* Global cyber grid background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 cyber-grid-bg cyber-grid-anim" />
          <div className="cyber-grid-fade-mask" />
          <div className="cyber-scan-line-global" />
        </div>
        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <ConnectWalletPrompt />
        </div>
      </div>
    );
  }

  // Authenticated - check whitelist
  if (requireWhitelist) {
    // Loading whitelist status
    if (isWhitelistLoading) {
      return (
        <div className="relative flex flex-col min-h-screen bg-eva-dark">
          {/* Global cyber grid background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute inset-0 cyber-grid-bg cyber-grid-anim" />
            <div className="cyber-grid-fade-mask" />
            <div className="cyber-scan-line-global" />
          </div>
          {/* Loading indicator */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-eva-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-eva-text-dim text-sm font-mono uppercase tracking-wider">
                Verifying Access...
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Not in whitelist
    if (!isWhitelisted) {
      return (
        <div className="relative flex flex-col min-h-screen bg-eva-dark">
          {/* Global cyber grid background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute inset-0 cyber-grid-bg cyber-grid-anim" />
            <div className="cyber-grid-fade-mask" />
            <div className="cyber-scan-line-global" />
          </div>
          {/* Content wrapper */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
            <NotInWhitelistPrompt message={whitelistMessage} />
          </div>
        </div>
      );
    }
  }

  // Authenticated and whitelisted (or whitelist not required)
  return <>{children}</>;
}

export default AlphaGuard;
