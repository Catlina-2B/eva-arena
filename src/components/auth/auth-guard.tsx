import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/stores/auth";
import { useAgentCheck } from "@/hooks/use-agent-check";

export interface AuthGuardProps {
  children: ReactNode;
  /** Redirect path when not authenticated (default: "/") */
  loginRedirect?: string;
  /** Whether to require an agent (default: true) */
  requireAgent?: boolean;
  /** Paths that don't require agent check */
  noAgentCheckPaths?: string[];
}

/**
 * Auth guard component that protects routes requiring authentication
 * Automatically redirects to create-agent if user has no agents
 */
export function AuthGuard({
  children,
  loginRedirect = "/",
  requireAgent = true,
  noAgentCheckPaths = ["/create-agent"],
}: AuthGuardProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  // Check agent status and handle redirect
  const shouldCheckAgent =
    requireAgent &&
    !noAgentCheckPaths.some((path) => location.pathname.startsWith(path));

  const { isLoading } = useAgentCheck({
    enabled: isAuthenticated && shouldCheckAgent,
    skipPaths: noAgentCheckPaths,
  });

  // Not authenticated - redirect to login/home
  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={loginRedirect} />;
  }

  // Loading agent data
  if (shouldCheckAgent && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-eva-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-eva-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-eva-text-dim text-sm font-mono">
            Checking agent status...
          </span>
        </div>
      </div>
    );
  }

  // Authenticated and (has agent or not required)
  return <>{children}</>;
}

export default AuthGuard;
