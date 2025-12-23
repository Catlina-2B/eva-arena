import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "eva_welcome_seen";

/**
 * Hook to detect and manage first-time visit state using localStorage.
 * Returns whether this is the user's first visit and a function to mark as visited.
 */
export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    // Check localStorage on initial render
    if (typeof window === "undefined") return false;

    return localStorage.getItem(STORAGE_KEY) !== "true";
  });

  // Sync with localStorage on mount (for SSR compatibility)
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY) === "true";

    setIsFirstVisit(!seen);
  }, []);

  const markVisited = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsFirstVisit(false);
  }, []);

  return { isFirstVisit, markVisited };
}
