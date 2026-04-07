import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useAccount } from "@particle-network/connectkit";

import { EvaLogo } from "@/components/eva-logo";
import { ModeSwitcher } from "@/components/mode-switcher";
import { ReferralDashboard } from "@/components/referral";
import { WalletConnectButton, WalletInterfaceModal } from "@/components/wallet";
import { WelcomeOnboardingModal } from "@/components/arena/welcome-onboarding-modal";
import { DepositModal } from "@/components/agent";
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

export function ManualNavbar() {
  const location = useLocation();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
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

  const { address } = useAccount();
  const { balance } = useTurnkeyBalanceStore();
  const { isAuthenticated, user } = useAuthStore();
  const turnkeyAddress = user?.turnkeyAddress ?? "";

  const navItems = [
    { href: "/", label: "Arena" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/history", label: "History" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-eva-darker/80 backdrop-blur-md border-b border-eva-border">
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between h-16">
            <Link className="flex items-center gap-2" to="/">
              <EvaLogo />
              <span className="text-[10px] font-display font-semibold uppercase tracking-[0.22em] text-eva-primary/80">
                Manual
              </span>
            </Link>

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

            <div className="flex items-center gap-3">
              <ModeSwitcher />

              {isAuthenticated && (
                <button
                  className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded border border-eva-secondary/50 text-eva-secondary hover:bg-eva-secondary/10 hover:border-eva-secondary transition-colors"
                  onClick={() => setIsReferralOpen(true)}
                >
                  Referral Rewards
                </button>
              )}

              {isAuthenticated && (
                <button
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium tracking-wider rounded transition-colors bg-eva-primary text-eva-darker hover:bg-eva-primary-dim cursor-pointer"
                  onClick={() => setIsDepositModalOpen(true)}
                >
                  Deposit
                </button>
              )}

              {isAuthenticated && (
                <button
                  className="group hidden md:flex flex-col items-start gap-0.5 px-4 py-2 rounded-lg text-left hover:bg-eva-card-hover hover:text-eva-text transition-colors cursor-pointer"
                  type="button"
                  onClick={() => setIsWalletModalOpen(true)}
                >
                  <span className="flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase text-eva-text-dim group-hover:text-eva-text">
                    Balance
                  </span>
                  <span className="text-sm font-mono font-medium text-eva-primary group-hover:underline">
                    SOL: {balance.toFixed(2)}
                  </span>
                </button>
              )}

              <WalletConnectButton
                onOpenRules={() => setIsHowToPlayOpen(true)}
              />

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

      <WalletInterfaceModal
        address={address || ""}
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {turnkeyAddress && (
        <DepositModal
          depositAddress={turnkeyAddress}
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
        />
      )}

      <WelcomeOnboardingModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

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
