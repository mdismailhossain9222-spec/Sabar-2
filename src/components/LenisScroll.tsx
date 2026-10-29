import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

type SmoothScrollProps = {
  children: ReactNode;
  lerp?: number;
  duration?: number;
};

/**
 * Lenis smooth scroll wrapper.
 *
 * Lenis runs its own `requestAnimationFrame` loop on top of the native
 * scroll position, so the DOM is never touched while scrolling — this keeps
 * the browser's `scroll` events and `getBoundingClientRect` honest while
 * giving the visual scroll a single, buttery lerp.
 */
export default function SmoothScroll({ children, lerp = 0.08, duration = 1.2 }: SmoothScrollProps) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp,
      duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      infinite: false,
      autoResize: true,
    });

    // Lenis must be driven on its own rAF loop — without it the scroll
    // position never interpolates and the effect is a no-op.
    const onScroll = () => lenis.raf(performance.now());
    const onResize = () => lenis.resize();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    (window as any).__lenis = lenis;

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, [lerp, duration]);

  return <>{children}</>;
}