import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useAccount } from "@particle-network/connectkit";

import { EvaLogo } from "@/components/eva-logo";
import { ReferralDashboard } from "@/components/referral";
import { WalletConnectButton, WalletInterfaceModal } from "@/components/wallet";
import { WelcomeOnboardingModal } from "@/components/arena/welcome-onboarding-modal";
import { DepositModal } from "@/components/agent";
import { HelpPanel } from "@/components/help-panel";
import { useTurnkeyBalanceStore } from "@/stores/turnkey-balance";
import { useAuthStore } from "@/stores/auth";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavLink({ href, children, isActive }: NavLinkProps) {
  return (
    <Link
      className={clsx(
        "px-4 py-2 text-sm font-medium tracking-wider uppercase transition-colors",
        isActive
          ? "text-eva-secondary"
          : "text-eva-text-dim hover:text-eva-text",
      )}
      to={href}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const location = useLocation();
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);

  useEffect(() => {
    if (!isReferralOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsReferralOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isReferralOpen]);

  // Get wallet address
  const { address } = useAccount();

  // Get balance from global store
  const { balance } = useTurnkeyBalanceStore();
  const { isAuthenticated, user } = useAuthStore();
  const turnkeyAddress = user?.turnkeyAddress ?? "";

  const navItems = [
    { href: "/", label: "Arena" },
    { href: "/my-agent", label: "My Agent" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-eva-darker/80 backdrop-blur-md border-b border-eva-border">
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link className="flex items-center gap-2" to="/">
              <EvaLogo />
              <span className="text-[10px] font-display font-semibold uppercase tracking-[0.22em] text-eva-secondary/80">
                Internal
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  isActive={location.pathname === item.href}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Referral Button - Only show when authenticated */}
              {isAuthenticated && (
                <button
                  className="p-2 text-eva-text-dim hover:text-eva-primary transition-colors"
                  onClick={() => setIsReferralOpen(true)}
                  title="Referral Program"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </button>
              )}

              {/* Help Button */}
              <button
                className="p-2 text-eva-text-dim hover:text-eva-primary transition-colors"
                onClick={() => setIsHelpOpen(true)}
                title="Quick Reference"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </button>

              {/* Deposit Button - Only show when authenticated */}
              {isAuthenticated && (
                <button
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium tracking-wider rounded transition-colors bg-eva-primary text-eva-darker hover:bg-eva-primary-dim cursor-pointer"
                  onClick={() => setIsDepositModalOpen(true)}
                >
                  <svg
                    fill="none"
                    height="14"
                    viewBox="0 0 14 14"
                    width="14"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.4577 10.9995L10.6247 10.9995L10.6247 11.1665L3.4577 11.1665L3.4577 10.9995ZM3.74091 5.09131L6.10419 7.45361L6.9577 8.30713L6.9577 2.24951L7.12469 2.24951L7.12469 8.30713L10.3415 5.09033L10.4597 5.2085L7.04169 8.62646L3.62372 5.2085L3.74091 5.09131Z"
                      fill="currentColor"
                      stroke="currentColor"
                    />
                  </svg>
                  Deposit
                </button>
              )}

              {/* Balance Display - Only show when authenticated */}
              {isAuthenticated && (
                <button
                  className="group hidden md:flex flex-col items-start gap-0.5 px-4 py-2 rounded-lg text-left hover:bg-eva-card-hover hover:text-eva-text transition-colors cursor-pointer"
                  type="button"
                  onClick={() => setIsWalletModalOpen(true)}
                >
                  <span className="flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase text-eva-text-dim group-hover:text-eva-text">
                    Balance
                    <svg
                      className="w-3 h-3 opacity-70 group-hover:opacity-100"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </span>
                  <span className="text-sm font-mono font-medium text-eva-primary group-hover:underline">
                    SOL: {balance.toFixed(2)}
                  </span>
                </button>
              )}

              <WalletConnectButton
                onOpenRules={() => setIsHowToPlayOpen(true)}
              />

              {/* Mobile menu toggle */}
              <button className="md:hidden p-2 text-eva-text-dim hover:text-eva-text">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* How to Play Modal */}
      <WelcomeOnboardingModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      {/* Wallet Interface Modal */}
      <WalletInterfaceModal
        address={address || ""}
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* Deposit Modal */}
      {turnkeyAddress && (
        <DepositModal
          depositAddress={turnkeyAddress}
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
        />
      )}

      {/* Help Panel */}
      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Referral Drawer */}
      {isReferralOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsReferralOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-eva-darker border-l border-eva-border/20 shadow-2xl animate-slide-in-right">
            <ReferralDashboard onClose={() => setIsReferralOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
