import { useEffect, useState, useCallback, useRef } from "react";

/**
 * Tracks browser tab visibility using the Page Visibility API.
 * Returns whether the page is currently visible and an optional
 * callback that fires once when the tab becomes visible again
 * (useful for refetching stale data after a hidden period).
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(() => !document.hidden);
  const wasHiddenRef = useRef(false);
  const onVisibleCallbacksRef = useRef<Set<() => void>>(new Set());

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;

      if (!visible) {
        wasHiddenRef.current = true;
      }

      setIsVisible(visible);

      if (visible && wasHiddenRef.current) {
        wasHiddenRef.current = false;
        onVisibleCallbacksRef.current.forEach((cb) => cb());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const onBecomeVisible = useCallback((callback: () => void) => {
    onVisibleCallbacksRef.current.add(callback);

    return () => {
      onVisibleCallbacksRef.current.delete(callback);
    };
  }, []);

  return { isVisible, onBecomeVisible };
}
