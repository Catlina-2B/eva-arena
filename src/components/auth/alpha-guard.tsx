import { type ReactNode } from "react";
import { useAccount, useDisconnect } from "@particle-network/connectkit";

import { useAuthStore } from "@/stores/auth";
import { useWalletAuth } from "@/hooks/use-wallet-auth";

import { ConnectWalletPrompt } from "@/components/wallet";
import { NotInWhitelistPrompt } from "./not-in-whitelist-prompt";

export interface AlphaGuardProps {
  children: ReactNode;
  /** Custom message for rejected users */
  rejectedMessage?: string;
}

/**
 * Alpha Guard component that protects routes requiring authentication.
 *
 * Shows appropriate UI for each state:
 * - Not connected: Shows connect wallet prompt
 * - Connected, logging in: Shows loading state
 * - Login rejected (not whitelisted): Shows access restricted message
 * - Authenticated: Shows children
 */
export function AlphaGuard({
  children,
  rejectedMessage,
}: AlphaGuardProps) {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, logout } = useAuthStore();
  const { isLoggingIn, loginError } = useWalletAuth();

  // Handle disconnect - both wallet and auth
  const handleDisconnect = () => {
    logout();
    disconnect();
  };

  // Not connected - show connect wallet prompt
  if (!isConnected) {
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

  // Connected but logging in - show loading state
  if (isLoggingIn) {
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
              Signing In...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Connected but login failed (rejected / not whitelisted)
  if (!isAuthenticated && loginError) {
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
          <NotInWhitelistPrompt
            message={rejectedMessage || loginError}
            walletAddress={address}
            onDisconnect={handleDisconnect}
          />
        </div>
      </div>
    );
  }

  // Connected but not authenticated yet (waiting for signature)
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

  // Authenticated - show children
  return <>{children}</>;
}

export default AlphaGuard;
