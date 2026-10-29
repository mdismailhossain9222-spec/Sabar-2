type DaisyPatternProps = {
  id?: string;
  className?: string;
  opacity?: number;
  petal?: string;
  center?: string;
  stem?: string;
};

/** A light, repeating hand-drawn daisy motif for dreamy section backgrounds. */
export function DaisyPattern({
  id = "sabar-daisy",
  className = "",
  opacity = 0.35,
  petal = "#F09DBB",
  center = "#FBF8CE",
  stem = "#9EB79B",
}: DaisyPatternProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id={id} width="190" height="190" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <g fill={petal} opacity="0.62">
            <g transform="translate(44 44)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <ellipse key={angle} cx="0" cy="-12" rx="3.6" ry="8" transform={`rotate(${angle})`} />
              ))}
            </g>
            <circle cx="44" cy="44" r="3.6" fill={center} opacity="0.98" />
            <g transform="translate(145 142) scale(0.62)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <ellipse key={angle} cx="0" cy="-12" rx="3.6" ry="8" transform={`rotate(${angle})`} />
              ))}
            </g>
            <circle cx="145" cy="142" r="3.2" fill={center} opacity="0.98" />
          </g>
          <path
            d="M44 58c1 21-4 34-13 48M146 154c3 13 1 22-3 31"
            stroke={stem}
            strokeWidth="1.2"
            opacity="0.56"
            fill="none"
          />
          <path d="M37 87c-9-1-14 3-17 8 8 2 14 0 17-8Z" fill={stem} opacity="0.48" />
          <path d="M144 168c7-1 12 2 14 6-7 2-12 0-14-6Z" fill={stem} opacity="0.48" />
          <circle cx="112" cy="46" r="1.4" fill={petal} opacity="0.55" />
          <circle cx="26" cy="131" r="1.4" fill={petal} opacity="0.55" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** A single illustrative daisy stem for floating accents. */
export function DaisyStem({
  className = "",
  petal = "#FBF8CE",
  center = "#F09DBB",
  stem = "#9EB79B",
}: {
  className?: string;
  petal?: string;
  center?: string;
  stem?: string;
}) {
  return (
    <svg viewBox="0 0 140 210" fill="none" aria-hidden="true" className={className}>
      <path
        d="M76 206C74 159 69 125 54 92c-8-18-11-34-7-50M70 139c-16-4-26 3-33 12 14 4 25 0 33-12ZM72 166c13-6 24-2 31 5-12 6-23 4-31-5Z"
        stroke={stem}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <g transform="translate(48 43)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-20"
            rx="6.6"
            ry="15"
            fill={petal}
            stroke={center}
            strokeWidth="0.9"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r="6.4" fill={center} stroke={petal} strokeWidth="0.9" />
      </g>
      <g transform="translate(108 161) scale(0.54)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-20"
            rx="6.6"
            ry="15"
            fill={petal}
            stroke={center}
            strokeWidth="1.2"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r="6.4" fill={center} stroke={petal} strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/** A large, soft daisy bloom built from simple SVG shapes. */
export function DaisyBloom({
  className = "",
  petal = "currentColor",
  center = "#FBF8CE",
  petals = 12,
}: {
  className?: string;
  petal?: string;
  center?: string;
  petals?: number;
}) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className}>
      {Array.from({ length: petals }).map((_, index) => {
        const angle = index * (360 / petals);
        return (
          <ellipse
            key={angle}
            cx="60"
            cy="29"
            rx="9.5"
            ry="24"
            fill={petal}
            stroke="currentColor"
            strokeWidth="0.9"
            transform={`rotate(${angle} 60 60)`}
          />
        );
      })}
      <circle cx="60" cy="60" r="14" fill={center} stroke="currentColor" strokeWidth="1" />
      <circle cx="56" cy="56" r="1.4" fill="currentColor" opacity="0.5" />
      <circle cx="63" cy="61" r="1.1" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

export function UnderlineFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 260 16"
      fill="none"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M2 11.5c47-7 89-9 128-9 42 0 87 3 128 8M48 14c34-3 67-4 99-4 27 0 50 1 70 3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SparkleOrnament({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" aria-hidden="true" className={className}>
      <path
        d="M30 3c1.8 16.3 8.7 23.2 25 25-16.3 1.8-23.2 8.7-25 25-1.8-16.3-8.7-23.2-25-25 16.3-1.8 23.2-8.7 25-25Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="30" cy="30" r="3.2" fill="currentColor" />
    </svg>
  );
}
