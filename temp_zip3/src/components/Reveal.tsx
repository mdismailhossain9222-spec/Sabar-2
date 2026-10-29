import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useInView } from "@/hooks/useInView";

type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "fade";

/**
 * Nested SplitText components inherit this trigger so an entire block
 * reveals in a single, choreographed moment.
 */
const RevealContext = createContext<boolean | null>(null);

export function useRevealContext() {
  return useContext(RevealContext);
}

export type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay in milliseconds before this block begins its transition. */
  delay?: number;
  variant?: RevealVariant;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  /** Hold the hidden state until another moment (e.g. an intro) completes. */
  start?: boolean;
  id?: string;
  style?: CSSProperties;
};

const hiddenState: Record<RevealVariant, string> = {
  up: "opacity-0 translate-y-10",
  down: "opacity-0 -translate-y-10",
  left: "opacity-0 -translate-x-10",
  right: "opacity-0 translate-x-10",
  scale: "opacity-0 scale-[0.94]",
  fade: "opacity-0",
};

const visibleState: Record<RevealVariant, string> = {
  up: "opacity-100 translate-y-0",
  down: "opacity-100 translate-y-0",
  left: "opacity-100 translate-x-0",
  right: "opacity-100 translate-x-0",
  scale: "opacity-100 scale-100",
  fade: "opacity-100",
};

/**
 * Pure React + Tailwind scroll reveal. No animation libraries.
 * The wrapper keeps its layout footprint while its contents transition in.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  threshold = 0.15,
  rootMargin = "0px 0px -8% 0px",
  once = true,
  start = true,
  id,
  style,
}: RevealProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold,
    rootMargin,
    once,
    enabled: start,
  });

  return (
    <RevealContext.Provider value={isInView}>
      <div
        ref={ref}
        id={id}
        data-revealed={isInView ? "true" : "false"}
        className={`transition-all duration-700 ease-out will-change-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none ${
          isInView ? visibleState[variant] : hiddenState[variant]
        } ${className}`}
        style={{
          transitionDelay: isInView ? `${delay}ms` : "0ms",
          ...style,
        }}
      >
        {children}
      </div>
    </RevealContext.Provider>
  );
}
