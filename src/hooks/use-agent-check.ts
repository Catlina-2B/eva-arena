import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useMyAgents } from "./use-agents";

import { useAuthStore } from "@/stores/auth";

export interface UseAgentCheckOptions {
  /** Path to redirect when user has no agent (default: "/create-agent") */
  noAgentRedirect?: string;
  /** Paths to skip the check (e.g., the create-agent page itself) */
  skipPaths?: string[];
  /** Whether to enable the check (default: true) */
  enabled?: boolean;
}

export interface UseAgentCheckReturn {
  /** Whether user has at least one agent */
  hasAgent: boolean;
  /** Whether the check is loading */
  isLoading: boolean;
  /** Number of agents user has */
  agentCount: number;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Hook to check if user has an agent and redirect to create page if not
 */
export function useAgentCheck(
  options: UseAgentCheckOptions = {},
): UseAgentCheckReturn {
  const {
    noAgentRedirect = "/create-agent",
    skipPaths = ["/create-agent"],
    enabled = true,
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  // Fetch user's agents
  const { data, isLoading, isFetched } = useMyAgents();

  const agents = data?.agents ?? [];
  const hasAgent = agents.length > 0;
  const agentCount = agents.length;

  // Check if current path should skip the redirect
  const shouldSkip = skipPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  // Redirect to create-agent page if user is authenticated but has no agents
  useEffect(() => {
    if (!enabled || !isAuthenticated || isLoading || !isFetched || shouldSkip) {
      return;
    }

    if (!hasAgent) {
      navigate(noAgentRedirect, { replace: true });
    }
  }, [
    enabled,
    isAuthenticated,
    isLoading,
    isFetched,
    hasAgent,
    shouldSkip,
    navigate,
    noAgentRedirect,
  ]);

  return {
    hasAgent,
    isLoading,
    agentCount,
    isAuthenticated,
  };
}

export default useAgentCheck;
