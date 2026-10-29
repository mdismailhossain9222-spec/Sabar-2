import { useEffect, useRef, useState } from "react";

export type UseInViewOptions = {
  /** How much of the element must be visible before revealing (0–1). */
  threshold?: number | number[];
  /** Shrinks the observer viewport, e.g. to reveal slightly before the edge. */
  rootMargin?: string;
  /** Once revealed, keep the element visible instead of toggling back. */
  once?: boolean;
  /** Allows a parent Reveal to own the trigger for its children. */
  enabled?: boolean;
};

export type UseInViewResult<T extends HTMLElement = HTMLDivElement> = {
  ref: React.RefObject<T | null>;
  isInView: boolean;
};

/**
 * Native, dependency-free viewport detection.
 * Falls back to an immediate reveal for browsers without IntersectionObserver
 * and for visitors who prefer reduced motion.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -8% 0px",
  once = true,
  enabled = true,
}: UseInViewOptions = {}): UseInViewResult<T> {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const node = ref.current;
    if (!node) return;

    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setIsInView(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled, threshold, rootMargin, once]);

  return { ref, isInView };
}
