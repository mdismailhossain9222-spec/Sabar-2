import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </Icon>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </Icon>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5.4 8.5h13.2l.9 10.1a2 2 0 0 1-2 2.2H6.5a2 2 0 0 1-2-2.2l.9-10.1Z" />
      <path d="M9 9V6.8a3 3 0 0 1 6 0V9" />
    </Icon>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 8h17M3.5 16h17" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m15.6 15.6 4.4 4.4" />
    </Icon>
  );
}

export function RulerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.8 14.9 14.9 3.8a1.8 1.8 0 0 1 2.6 0l2.7 2.7a1.8 1.8 0 0 1 0 2.6L9.1 20.2a1.8 1.8 0 0 1-2.6 0l-2.7-2.7a1.8 1.8 0 0 1 0-2.6Z" />
      <path d="m7 11.7 2-2M10.1 8.6l2-2M13.2 5.5l2-2M8.6 16.1l1.5-1.5" />
    </Icon>
  );
}

export function HeartIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Icon {...props} fill={filled ? "currentColor" : "none"}>
      <path d="M20.4 5.6a5.1 5.1 0 0 0-7.2 0L12 6.8l-1.2-1.2a5.1 5.1 0 1 0-7.2 7.2l8.4 8.4 8.4-8.4a5.1 5.1 0 0 0 0-7.2Z" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M9 7V5h6v2M6.5 7l.8 12a1.7 1.7 0 0 0 1.7 1.6h6a1.7 1.7 0 0 0 1.7-1.6l.8-12M10 11v5M14 11v5" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.5" y="10.2" width="15" height="10.3" rx="2.4" />
      <path d="M8.2 10.2V7.4a3.8 3.8 0 0 1 7.6 0v2.8M12 14.4v2.2" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.2 19 6v5.5c0 4.2-2.8 7.6-7 9.3-4.2-1.7-7-5.1-7-9.3V6l7-2.8Z" />
      <path d="m9 12 2.2 2.2L15.4 10" />
    </Icon>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 6.5h10.5v10H3zM13.5 10h4l3 3v3.5h-7z" />
      <circle cx="7" cy="17.8" r="1.8" />
      <circle cx="17" cy="17.8" r="1.8" />
    </Icon>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <Icon {...props} fill="currentColor" stroke="none">
      <path d="M12 2.4c.5 5.4 2.2 7.1 7.6 7.6-5.4.5-7.1 2.2-7.6 7.6-.5-5.4-2.2-7.1-7.6-7.6 5.4-.5 7.1-2.2 7.6-7.6Z" transform="translate(0 2)" />
    </Icon>
  );
}

export function DaisyIcon(props: IconProps) {
  return (
    <Icon strokeWidth={1.35} {...props}>
      <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <ellipse key={angle} cx="12" cy="6.1" rx="1.55" ry="2.6" transform={`rotate(${angle} 12 12)`} />
      ))}
    </Icon>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 4C11 4 4.8 8.3 4.8 14.1A5.9 5.9 0 0 0 15 18.2C19.2 15.6 20 9 20 4Z" />
      <path d="M4 21c1.8-6 5.5-9.8 11-12" />
    </Icon>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M3.4 12h17.2M12 3.2c2.2 2.5 3.3 5.5 3.3 8.8s-1.1 6.3-3.3 8.8c-2.2-2.5-3.3-5.5-3.3-8.8S9.8 5.7 12 3.2Z" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </Icon>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 10.4c0 5.2-8 11-8 11s-8-5.8-8-11a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10.4" r="2.7" />
    </Icon>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.8" />
      <circle cx="12" cy="12" r="3.7" />
      <circle cx="17.2" cy="6.9" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function PinterestIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.7 20c.7-2 1.7-5.1 2-6.3M9.2 13.8c-.4-2.4 1.1-4.6 3.5-4.6 1.9 0 3.2 1.2 3.2 3.1 0 2.3-1.2 4.2-2.9 4.2-1 0-1.7-.8-1.5-1.8" />
    </Icon>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 3.5c.3 2.4 1.7 4 4.2 4.3v3c-1.6.1-3-.4-4.2-1.4v6.2a5.7 5.7 0 1 1-4.9-5.6v3.1a2.6 2.6 0 1 0 1.9 2.5V3.5H14Z" />
    </Icon>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.4 11.8a8.3 8.3 0 0 1-12.2 7.4L3.7 20.4l1.2-4.4A8.3 8.3 0 1 1 20.4 11.8Z" />
      <path d="M9.1 8.4c.2-.4.5-.5.9-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.3 0 .5-.2.7l-.6.6c-.2.2-.2.4-.1.6.5.9 1.4 1.7 2.4 2.1.3.1.5.1.7-.1l.6-.7c.2-.2.4-.3.7-.2l1.7.8c.3.1.4.3.4.6 0 1.2-1 2.1-2.2 2.1-3.1 0-6-2.9-6-6 0-.7.2-1.4.5-2.1Z" />
    </Icon>
  );
}

/** Official WhatsApp brand glyph, filled for use on the green concierge button. */
export function WhatsAppLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export function AppleGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" className={`fill-current ${className}`} aria-hidden="true" focusable="false">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </Icon>
  );
}

export function GoogleGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a6 6 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-4V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z" />
      <path fill="#EA4335" d="M12 6a5.4 5.4 0 0 1 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.4L6.4 10A6 6 0 0 1 12 6Z" />
    </svg>
  );
}

export function ApplePayMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 leading-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 384 512" className="h-4 w-3 fill-current" focusable="false">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </svg>
      <span className="font-sans text-xs font-semibold tracking-[-0.02em]">Pay</span>
    </span>
  );
}

export function GooglePayMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 leading-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-4 w-4" focusable="false">
        <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a6 6 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-4V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z" />
        <path fill="#EA4335" d="M12 6a5.4 5.4 0 0 1 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.4L6.4 10A6 6 0 0 1 12 6Z" />
      </svg>
      <span className="font-sans text-xs font-semibold tracking-[-0.02em]">Pay</span>
    </span>
  );
}

export function VisaMastercardMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 leading-none ${className}`} aria-hidden="true">
      <span className="font-sans text-[11px] font-bold italic tracking-[0.02em]">VISA</span>
      <span className="flex items-center" aria-hidden="true">
        <span className="h-3.5 w-3.5 rounded-full bg-mainPink" />
        <span className="-ml-1.5 h-3.5 w-3.5 rounded-full bg-daisyGreen/90 mix-blend-multiply" />
      </span>
    </span>
  );
}

export function CodMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 leading-none ${className}`} aria-hidden="true">
      <TruckIcon className="h-4 w-4" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">COD</span>
    </span>
  );
}
