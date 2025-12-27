import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "eva_first_deposit_prompt_seen";

/**
 * Hook to detect and manage first deposit prompt state using localStorage.
 * Returns whether user should see the first deposit prompt and a function to dismiss it.
 */
export function useFirstDepositPrompt() {
  const [shouldShowPrompt, setShouldShowPrompt] = useState<boolean>(() => {
    // Check localStorage on initial render
    if (typeof window === "undefined") return false;

    return localStorage.getItem(STORAGE_KEY) !== "true";
  });

  // Sync with localStorage on mount (for SSR compatibility)
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY) === "true";

    setShouldShowPrompt(!seen);
  }, []);

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShouldShowPrompt(false);
  }, []);

  return { shouldShowPrompt, dismissPrompt };
}

