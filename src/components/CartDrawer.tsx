import { useEffect, useRef } from "react";
import { FlamingoMark } from "@/components/Brand";
import {
  ApplePayMark,
  CloseIcon,
  LockIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  TruckIcon,
  VisaMastercardMark,
} from "@/components/Icons";
import { formatMoney, type CurrencyCode, type Product } from "@/data/shop";

export type DrawerItem = {
  product: Product;
  quantity: number;
  size: string;
  lineKey: string;
};

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  items: DrawerItem[];
  currency: CurrencyCode;
  onQuantityChange: (lineKey: string, delta: number) => void;
  onRemove: (lineKey: string) => void;
  onCheckout: () => void;
};

const FREE_DELIVERY_AED = 600;

export function CartDrawer({
  open,
  onClose,
  items,
  currency,
  onQuantityChange,
  onRemove,
  onCheckout,
}: CartDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalAed = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const remaining = Math.max(0, FREE_DELIVERY_AED - subtotalAed);
  const progress = Math.min(100, (subtotalAed / FREE_DELIVERY_AED) * 100);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-[#4A0E17]/80 backdrop-blur-[3px]"
        aria-label="Close shopping bag"
        onClick={onClose}
        tabIndex={-1}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="animate-drawer-in absolute inset-y-0 right-0 flex h-full w-full max-w-[440px] flex-col overflow-hidden bg-[#4A0E17] shadow-[-32px_0_90px_-30px_rgba(74,14,23,0.8)]"
      >

        <header className="relative flex items-start justify-between gap-4 border-b border-[#FAF5EF]/10 px-6 pb-5 pt-6">
          <div>
            <p className="eyebrow flex items-center gap-2 text-[#FAF5EF]/55">
              <FlamingoMark className="h-4 w-4 text-[#FAF5EF]" /> Your edit
            </p>
            <h2 id="cart-title" className="editorial-heading mt-2 text-[2rem] leading-none text-[#FAF5EF]">
              Shopping Bag{" "}
              <span className="font-sans text-xs not-italic font-semibold tracking-[0.18em] text-[#FAF5EF]/45">
                ({itemCount})
              </span>
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FAF5EF]/12 bg-[#FAF5EF]/10 text-[#FAF5EF] transition hover:border-[#FAF5EF]/40 hover:bg-[#FAF5EF]/20 hover:text-[#FAF5EF]"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="relative border-b border-[#FAF5EF]/10 px-6 py-4">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#FAF5EF]/60">
            <TruckIcon className="h-4 w-4 text-[#FAF5EF]" />
            {remaining > 0 ? (
              <span>
                <span className="text-[#FAF5EF]">{formatMoney(remaining, currency)}</span> from
                complimentary delivery
              </span>
            ) : (
              <span>Complimentary delivery unlocked</span>
            )}
          </p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#FAF5EF]/10">
            <div
              className="h-full rounded-full bg-daisyGreen transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#FAF5EF]/15 bg-[#FAF5EF]/10 text-[#FAF5EF]">
                <FlamingoMark className="h-10 w-10" />
              </span>
              <p className="editorial-heading mt-6 text-2xl text-[#FAF5EF]">Your edit awaits.</p>
              <p className="mt-2 max-w-[250px] text-xs leading-relaxed text-[#FAF5EF]/55">
                Considered pieces, made in small numbers. Find the one that feels like you.
              </p>
              <button
                type="button"
                className="liquid-btn-wrapper mt-6 px-6 py-3"
                onClick={onClose}
                aria-label="Continue browsing the collection"
              >
                Continue browsing
              </button>
            </div>
          ) : (
            <ul className="space-y-1" aria-label="Items in your shopping bag">
              {items.map(({ product, quantity, size, lineKey }) => (
                <li
                  key={lineKey}
                  className="flex gap-4 border-b border-[#FAF5EF]/10 py-5 first:pt-1 last:border-b-0"
                >
                  <div className="relative aspect-[3/4] w-[78px] shrink-0 overflow-hidden rounded-[0.9rem] border border-[#FAF5EF]/20 bg-[#FAF5EF]">
                    <img
                      src={product.image}
                      alt={product.imageAlt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="eyebrow text-[8px] text-[#FAF5EF]/50">{product.category}</p>
                        <h3 className="mt-1 truncate font-serif text-lg leading-tight text-[#FAF5EF]">
                          {product.name}
                        </h3>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#FAF5EF]/45">
                          {product.colour} <span className="text-[#FAF5EF]/25">·</span> Size {size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(lineKey)}
                        aria-label={`Remove ${product.name}, size ${size}, from your shopping bag`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#FAF5EF]/35 transition hover:bg-[#FAF5EF]/10 hover:text-[#FAF5EF]"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <div className="flex items-center rounded-full border border-[#FAF5EF]/12 bg-[#FAF5EF]/10">
                        <button
                          type="button"
                          onClick={() => onQuantityChange(lineKey, -1)}
                          aria-label={`Decrease quantity of ${product.name}, size ${size}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#FAF5EF]/60 transition hover:text-[#FAF5EF] disabled:opacity-30"
                          disabled={quantity <= 1}
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span
                          className="min-w-5 text-center text-[11px] font-bold tabular-nums"
                          aria-live="polite"
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuantityChange(lineKey, 1)}
                          aria-label={`Increase quantity of ${product.name}, size ${size}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#FAF5EF]/60 transition hover:text-[#FAF5EF]"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs font-bold tracking-[0.02em] text-[#FAF5EF]">
                        {formatMoney(product.price * quantity, currency)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="relative border-t border-[#FAF5EF]/10 bg-[#FAF5EF]/10 px-6 pb-6 pt-5 backdrop-blur-md">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-[#FAF5EF]/60">Subtotal</span>
              <span className="font-serif text-xl text-[#FAF5EF]">
                {formatMoney(subtotalAed, currency)}
              </span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-[#FAF5EF]/45">
              Taxes included. Shipping calculated at checkout.
            </p>
            <button
              type="button"
              onClick={onCheckout}
              className="liquid-btn-wrapper mt-4 w-full py-4"
              aria-label="Proceed to secure checkout"
            >
              <LockIcon className="h-3.5 w-3.5" />
              Proceed to secure checkout
            </button>
            <div className="mt-3 flex items-center justify-between gap-3 text-[#FAF5EF]/50">
              <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em]">
                <LockIcon className="h-3 w-3" /> Secure
              </span>
              <span className="flex items-center gap-3">
                <ApplePayMark />
                <VisaMastercardMark />
              </span>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}
