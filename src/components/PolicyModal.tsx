import { type ReactNode } from "react";
import { CloseIcon } from "@/components/Icons";

type PolicyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function PolicyModal({ isOpen, onClose, title, children }: PolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        className="liquid-glass-light relative max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-2xl border border-[#4A0E17]/30 bg-[#4A0E17]/95 p-6 sm:p-8 shadow-[0_35px_100px_-30px_rgba(44,28,35,0.65)] backdrop-blur-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-[#4A0E17]/75 text-[#FAF5EF] shadow-liquid backdrop-blur-md transition-transform duration-300 hover:rotate-90 hover:bg-[#FAF5EF]"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <h2 id="policy-modal-title" className="editorial-heading text-[clamp(1.5rem,3vw,2rem)] leading-tight text-[#FAF5EF] mb-6">
          {title}
        </h2>

        <div className="text-[12px] leading-[1.8] text-[#FAF5EF]/65 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}