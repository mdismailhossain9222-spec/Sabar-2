import { createElement, type ElementType, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { useRevealContext } from "@/components/Reveal";

export type SplitTextProps = {
  text: string;
  /** Semantic element to render — defaults to an inline span. */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  wordClassName?: string;
  /** Optional trailing accent rendered with the final word, e.g. a coloured full stop. */
  accent?: string;
  accentClassName?: string;
  /** Base delay in milliseconds. */
  delay?: number;
  /** Additional delay applied to each consecutive word. */
  stagger?: number;
  threshold?: number;
  once?: boolean;
  id?: string;
};

/**
 * Masked word-by-word rise. When used inside <Reveal>, it waits for the
 * parent's intersection state; on its own it observes the viewport itself.
 */
export function SplitText({
  text,
  as = "span",
  className = "",
  wordClassName = "",
  accent,
  accentClassName = "",
  delay = 0,
  stagger = 55,
  threshold = 0.2,
  once = true,
  id,
}: SplitTextProps) {
  const parentInView = useRevealContext();
  const { ref, isInView: ownInView } = useInView<HTMLElement>({
    threshold,
    once,
    enabled: parentInView === null,
  });

  const isInView = parentInView ?? ownInView;
  const words = text.split(/\s+/).filter(Boolean);

  const wordNodes: ReactNode[] = words.map((word, index) => (
    <span
      key={`${word}-${index}`}
      aria-hidden="true"
      className={`mr-[0.22em] inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] align-bottom ${
        index === words.length - 1 ? "mr-0" : ""
      }`}
    >
      <span
        className={`inline-block will-change-transform transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:translate-y-0 motion-reduce:transition-none ${
          isInView ? "translate-y-0" : "translate-y-full"
        } ${wordClassName}`}
        style={{ transitionDelay: `${delay + index * stagger}ms` }}
      >
        {word}
      </span>
    </span>
  ));

  if (accent) {
    wordNodes.push(
      <span
        key="accent"
        aria-hidden="true"
        className="inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] align-bottom"
      >
        <span
          className={`inline-block will-change-transform transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:translate-y-0 motion-reduce:transition-none ${
            isInView ? "translate-y-0" : "translate-y-full"
          } ${accentClassName}`}
          style={{ transitionDelay: `${delay + words.length * stagger}ms` }}
        >
          {accent}
        </span>
      </span>
    );
  }

  return createElement(
    as as ElementType,
    {
      ref,
      id,
      className,
      "aria-label": `${text}${accent ?? ""}`,
    },
    ...wordNodes
  );
}
