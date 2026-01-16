import { useEffect, useRef, useState, type RefObject } from "react";

interface UseIntersectionObserverOptions {
  /** Threshold for intersection (0-1) */
  threshold?: number;
  /** Root margin to extend/shrink the detection area */
  rootMargin?: string;
  /** Whether the observer is enabled */
  enabled?: boolean;
}

/**
 * Hook for detecting when an element enters the viewport
 *
 * @example
 * ```tsx
 * const [ref, isIntersecting] = useIntersectionObserver<HTMLDivElement>({
 *   rootMargin: "200px",
 *   enabled: hasNextPage,
 * });
 *
 * useEffect(() => {
 *   if (isIntersecting) {
 *     fetchNextPage();
 *   }
 * }, [isIntersecting]);
 *
 * return <div ref={ref}>Load more trigger</div>;
 * ```
 */
export function useIntersectionObserver<T extends HTMLElement>({
  threshold = 0.1,
  rootMargin = "100px",
  enabled = true,
}: UseIntersectionObserverOptions = {}): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!enabled || !ref.current) {
      setIsIntersecting(false);

      return;
    }

    const element = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [enabled, threshold, rootMargin]);

  return [ref, isIntersecting];
}
