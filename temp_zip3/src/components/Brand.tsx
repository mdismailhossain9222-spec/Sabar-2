import type { SVGProps } from "react";

type MarkProps = SVGProps<SVGSVGElement> & { withDisc?: boolean };

/**
 * The Sabar flamingo: an original line-drawn mark used across the site.
 * It inherits currentColor so it can shift from darkText to daisyYellow as needed.
 */
export function FlamingoMark({ withDisc = false, className = "", ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {withDisc && <circle cx="24" cy="24" r="23.25" fill="currentColor" opacity="0.12" />}
      <path
        d="M30.4 14.8c-3.1 2.3-4.2 5.8-5.7 9.1-1.9 4.2-4.6 8.2-8.8 10.2-3.2 1.6-7.4.9-8.6-2.3-1.1-3 1.4-5.8 4.4-6.7 3.6-1 7.2-1.1 10.3-3.4 2.7-2 4.2-5.1 4.8-8.4"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.8 35.6c3.6 1.2 7.8.6 10.8-1.8 3.2-2.6 4.6-6.6 6-10.4l2.1-5.6"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.4 37.2c1.1 1.7 2.4 3.3 4.1 4.5M25.9 34.4c.3 2.2 1 4.3 2.1 6.2M19.7 41.7h4.4M27.5 40.6h4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M27.1 16.2c-.4-2.8 1.5-5.2 3.8-5.9 2-.6 4.3.4 5.2 2.3.9 1.8.3 3.9-1.2 5.1l-3.4 2.5"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M33.8 9.9 43 12.2l-8 3.3"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="33.1" cy="12.3" r="1.05" fill="currentColor" />
      <path
        d="M16.5 28.6c2.4-1.8 5.6-2.8 8.6-2.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

type WordmarkProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  ariaLabel?: string;
  showMark?: boolean;
};

const wordSizes = {
  sm: { name: "text-[1.5rem]", tag: "text-[6px] tracking-[0.42em]", mark: "h-7 w-7" },
  md: { name: "text-[2rem]", tag: "text-[7px] tracking-[0.4em]", mark: "h-9 w-9" },
  lg: { name: "text-[2.75rem]", tag: "text-[8px] tracking-[0.44em]", mark: "h-12 w-12" },
};

export function Wordmark({
  className = "",
  size = "md",
  href = "#home",
  ariaLabel = "Sabar by Simran — home",
  showMark = true,
}: WordmarkProps) {
  const s = wordSizes[size];
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      {showMark && (
        <span
          className={`${s.mark} flex shrink-0 items-center justify-center rounded-full border border-darkText/20 bg-lightPink/45 text-darkText transition-all duration-500 group-hover:rotate-[-8deg]`}
        >
          <FlamingoMark className="h-[72%] w-[72%]" />
        </span>
      )}
      <span className="flex flex-col items-start leading-none">
        <span
          className={`font-serif italic tracking-[-0.045em] text-darkText ${s.name}`}
        >
          Sabar
        </span>
        <span
          className={`mt-1.5 pl-[2px] font-sans font-bold uppercase ${s.tag} text-darkText/60`}
        >
          by Simran
        </span>
      </span>
    </a>
  );
}
