import { useQuery } from "@tanstack/react-query";

import { whitelistApi } from "@/services/api/whitelist";
import { useAuthStore } from "@/stores/auth";

/**
 * Query key for whitelist check
 */
export const whitelistKeys = {
  all: ["whitelist"] as const,
  check: () => [...whitelistKeys.all, "check"] as const,
};

export interface UseWhitelistCheckOptions {
  /** Enable the query (default: true when authenticated) */
  enabled?: boolean;
}

export interface UseWhitelistCheckReturn {
  /** Whether user is in the whitelist */
  isWhitelisted: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch the whitelist status */
  refetch: () => void;
}

/**
 * Hook to check if current user is in the alpha whitelist
 * Only runs when user is authenticated
 */
export function useWhitelistCheck(
  options: UseWhitelistCheckOptions = {},
): UseWhitelistCheckReturn {
  const { isAuthenticated } = useAuthStore();
  const { enabled = true } = options;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: whitelistKeys.check(),
    queryFn: () => whitelistApi.checkWhitelist(),
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes - whitelist status doesn't change often
    retry: 1, // Only retry once for whitelist check
  });

  return {
    isWhitelisted: data?.isWhitelisted ?? false,
    isLoading: isAuthenticated && enabled ? isLoading : false,
    error: error as Error | null,
    refetch,
  };
}

export default useWhitelistCheck;
