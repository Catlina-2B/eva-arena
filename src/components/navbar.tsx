import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

import { EvaLogo } from "@/components/eva-logo";
import { WalletConnectButton } from "@/components/wallet";
import { WelcomeOnboardingModal } from "@/components/arena/welcome-onboarding-modal";
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
        isActive ? "text-eva-secondary" : "text-eva-text-dim hover:text-eva-text",
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
  
  // Get balance from global store
  const { balance } = useTurnkeyBalanceStore();
  const { isAuthenticated } = useAuthStore();

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
              {/* Balance Display - Only show when authenticated */}
              {isAuthenticated && (
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-medium tracking-wider uppercase text-eva-text-dim">
                    Balance
                  </span>
                  <span className="text-sm font-mono font-medium text-eva-primary">
                    SOL: {balance.toFixed(2)}
                  </span>
                </div>
              )}

              <WalletConnectButton onOpenRules={() => setIsHowToPlayOpen(true)} />

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
    </>
  );
}
