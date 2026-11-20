import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";

/**
 * Singleton Stripe promise — avoids re-loading on every render.
 * The publishable key comes from Vite's import.meta.env (injected via .env).
 * NOTE: The real publishable key should be set in your .env or via
 * Cloudflare Pages/Workers environment variables. The placeholder
 * "pk_test_your_key_here" is intentionally not a valid key.
 */
let stripePromise: Promise<Stripe | null> | null = null;

declare global {
  interface ImportMetaEnv {
    readonly VITE_STRIPE_PUBLIC_KEY: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export function getStripePromise(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    // Strict check: reject placeholder keys entirely
    if (!publishableKey || publishableKey.startsWith("pk_test_your_key_here")) {
      console.warn("[Stripe] No valid publishable key found. Set VITE_STRIPE_PUBLIC_KEY in .env or via Cloudflare environment variables.");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

/**
 * React hook that returns a ready-to-use Stripe instance (or null if not configured).
 * Call this once at the top level of your checkout flow.
 */
export function useStripe(): Stripe | null {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    let mounted = true;
    getStripePromise().then((instance) => {
      if (mounted) setStripe(instance);
    });
    return () => { mounted = false; };
  }, []);

  return stripe;
}

/**
 * Initiates a Stripe Checkout Session redirect.
 * Expects your backend to have a `/api/create-checkout-session` endpoint
 * that returns `{ sessionId: string }`.
 */
export async function redirectToStripeCheckout(
  stripe: Stripe | null,
  items: Array<{
    productId: string;
    name: string;
    price: number; // in AED cents (e.g., 45000 for 450 AED)
    quantity: number;
    currency?: string; // ISO code: "aed", "usd", etc.
  }>,
  options?: {
    successUrl?: string;
    cancelUrl?: string;
    customerEmail?: string;
    metadata?: Record<string, string>;
  }
): Promise<{ error?: string }> {
  if (!stripe) {
    return { error: "Stripe not initialized. Check VITE_STRIPE_PUBLIC_KEY." };
  }
  // Cast to access redirectToCheckout which exists at runtime but not in types
  const stripeWithCheckout = stripe as Stripe & {
    redirectToCheckout: (options: { sessionId: string }) => Promise<{ error?: { message: string } }>;
  };

  try {
    // 1. Call your backend to create a Checkout Session
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          name: item.name,
          amount: item.price, // expecting amount in smallest currency unit (fils/cents)
          quantity: item.quantity,
          currency: item.currency || "aed",
        })),
        successUrl: options?.successUrl || `${window.location.origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: options?.cancelUrl || `${window.location.origin}/checkout?canceled=true`,
        customerEmail: options?.customerEmail,
        metadata: {
          ...options?.metadata,
          lineItems: JSON.stringify(
            items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              size: item.size || "Standard",
            }))
          ),
        },
      }),
    });

    if (!response.ok) {
      let err: { message?: string } = {};
      try {
        err = await response.json();
      } catch {
        // If response is not JSON, use status text
        err = { message: response.statusText };
      }
      throw new Error(err.message || `Server error: ${response.status}`);
    }

    const { sessionId } = await response.json();

    // 2. Redirect to Stripe Checkout
    const { error } = await stripeWithCheckout.redirectToCheckout({ sessionId });
    if (error) {
      return { error: error.message };
    }
    // redirectToCheckout doesn't return on success — the page unloads
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Convenience: convert AED whole-number amount to fils (smallest unit).
 * Stripe expects amounts in the smallest currency unit.
 */
export function aedToFils(aed: number): number {
  return Math.round(aed * 100);
}

/**
 * Convert AED to minor units for any ISO currency.
 * Currently only AED (100 fils) and USD/EUR/GBP (100 cents/pence) are supported.
 */
export function toMinorUnits(amount: number, _currency: "AED" | "USD" | "EUR" | "GBP"): number {
  return Math.round(amount * 100);
}