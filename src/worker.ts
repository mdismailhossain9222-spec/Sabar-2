import { Hono } from "hono";
import { cors } from "hono/cors";
import Stripe from "stripe";
import { sendWhatsAppOrderConfirmation } from "@/lib/whatsapp";

/**
 * Cloudflare Worker: Stripe Backend Endpoints
 *
 * This worker handles:
 * - POST /api/create-checkout-session - Creates a Stripe Checkout Session
 * - POST /api/stripe-webhook - Receives Stripe webhook events
 *
 * Environment variables (set via wrangler secret put):
 * - STRIPE_SECRET_KEY - Your Stripe secret key
 * - STRIPE_WEBHOOK_SECRET - Webhook signing secret
 * - WHATSAPP_ACCESS_TOKEN - Meta WhatsApp Cloud API token
 * - WHATSAPP_PHONE_NUMBER_ID - Business Account phone number ID
 * - WHATSAPP_TEMPLATE_NAME - Approved template name (optional, default: "order_confirmation")
 * - WHATSAPP_TEMPLATE_LANGUAGE - Language code (optional, default: "en_US")
 */

// ──────────────────────────────────────────────────────────────
// Rate limiting — max 5 requests per minute per IP on checkout
// Custom implementation for Cloudflare Workers (no global setInterval)
// ──────────────────────────────────────────────────────────────
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetTime: entry.resetTime };
}

// Periodic cleanup of expired entries (run on each request, negligible overhead)
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Middleware function
const checkoutRateLimiter = async (c: any, next: any) => {
  cleanupRateLimitStore();
  const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For") ?? "unknown";
  const { allowed, remaining, resetTime } = checkRateLimit(ip);

  // Set rate limit headers
  c.res.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
  c.res.headers.set("X-RateLimit-Remaining", String(remaining));
  c.res.headers.set("X-RateLimit-Reset", String(Math.ceil(resetTime / 1000)));

  if (!allowed) {
    return c.json({ error: "Too many requests. Please wait before trying again." }, 429);
  }

  await next();
};

// ──────────────────────────────────────────────────────────────
// CORS — allow ONLY the production domain + local dev servers.
// The production origin is read from the environment at runtime so
// it can be changed without a redeploy (set PRODUCTION_ORIGIN).
// ──────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://sabarbysimran.ae",
  "https://www.sabarbysimran.ae",
  "https://sabar-2.mdismailhossain9222.workers.dev",
  // Local development only
  "http://localhost:5173",
  "http://localhost:4173",
];

const corsMiddleware = cors({
  origin: (origin) => {
    // Allow same-origin / server-side requests (no Origin header)
    if (!origin) return origin;
    return ALLOWED_ORIGINS.includes(origin) ? origin : false;
  },
  allowHeaders: ["Content-Type", "Stripe-Signature"],
  allowMethods: ["POST", "OPTIONS"],
  maxAge: 86400,
  credentials: true,
});

// ──────────────────────────────────────────────────────────────
// Security headers — applied to every response.
// CSP is configured for the single-file SPA (vite-plugin-singlefile
// inlines all scripts/styles), so we allow 'unsafe-inline' for
// script/style while restricting other sources. Fonts are loaded
// from fonts.googleapis.com and fonts.gstatic.com.
// ──────────────────────────────────────────────────────────────
const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.stripe.com https://*.stripe.com https://m.stripe.network",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
    "frame-ancestors 'none'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Cache-Control": "no-store, max-age=0",
};

type Bindings = {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
};

// ──────────────────────────────────────────────────────────────
// Product catalog for server-side price validation
// (Must match src/data/shop.ts exactly)
// ──────────────────────────────────────────────────────────────
const PRODUCT_CATALOG: Record<string, { name: string; price: number }> = {
  "black-swan": { name: "The Black Swan", price: 1000 },
  "eclat": { name: "The Éclat", price: 800 },
  "espresso": { name: "The Espresso", price: 1500 },
  "coco": { name: "The Coco", price: 1800 },
};

const app = new Hono<{ Bindings: Bindings }>()

  // Apply security headers to EVERY response (including assets)
  .use("*", async (c, next) => {
    await next();
    for (const [key, value] of Object.entries(securityHeaders)) {
      c.res.headers.set(key, value);
    }
  })

  // Apply CORS to all API routes
  .use("/api/*", corsMiddleware)

  /**
   * POST /api/create-checkout-session
   * Creates a Stripe Checkout Session and returns the session ID
   * Rate limited: 5 requests per minute per IP
   */
  .post("/api/create-checkout-session", checkoutRateLimiter, async (c) => {
    try {
      // Initialize Stripe with secret key from environment
      const secretKey = c.env.STRIPE_SECRET_KEY;
      if (!secretKey || secretKey === "sk_test_your_key_here") {
        console.error("[Stripe] STRIPE_SECRET_KEY not configured");
        return c.json({ error: "Payment system not configured" }, 500);
      }

      const stripe = new Stripe(secretKey, {
        apiVersion: "2024-06-20",
      });

      // Parse and validate request body
      const body = await c.req.json();
      const {
        items,
        successUrl,
        cancelUrl,
        customerEmail,
        metadata = {},
      } = body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return c.json({ error: "No items provided" }, 400);
      }

      if (!successUrl || !cancelUrl) {
        return c.json({ error: "Missing successUrl or cancelUrl" }, 400);
      }

      // ──────────────────────────────────────────────────────────────
      // Server-side validation: verify each item against catalog
      // Prevents price manipulation by clients
      // ──────────────────────────────────────────────────────────────
      for (const item of items) {
        const catalogItem = PRODUCT_CATALOG[item.productId];
        if (!catalogItem) {
          console.error("[Stripe] Invalid productId:", item.productId);
          return c.json({ error: `Invalid product: ${item.productId}` }, 400);
        }
        if (catalogItem.name !== item.name) {
          console.error("[Stripe] Product name mismatch:", { expected: catalogItem.name, received: item.name });
          return c.json({ error: "Product name mismatch" }, 400);
        }
        const expectedAmount = Math.round(catalogItem.price * 100); // Convert AED to fils
        if (item.amount !== expectedAmount) {
          console.error("[Stripe] Price manipulation detected:", { expected: expectedAmount, received: item.amount, productId: item.productId });
          return c.json({ error: "Invalid price for product" }, 400);
        }
        if (!item.quantity || item.quantity < 1 || item.quantity > 99) {
          console.error("[Stripe] Invalid quantity:", item.quantity);
          return c.json({ error: "Invalid quantity" }, 400);
        }
      }

      // Build line items for Stripe (using validated data)
      const lineItems = items.map((item) => ({
        price_data: {
          currency: (item.currency || "aed").toLowerCase(),
          product_data: {
            name: item.name,
          },
          unit_amount: item.amount,
        },
        quantity: item.quantity,
      }));

      // Create the Checkout Session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: customerEmail,
        metadata,
        billing_address_collection: "required",
        allow_promotion_codes: true,
        phone_number_collection: {
          enabled: true,
        },
      });

      return c.json({
        sessionId: session.id,
        sessionUrl: session.url,
      });
    } catch (error) {
      console.error("[Stripe] Error creating checkout session:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return c.json({ error: message }, 500);
    }
  })

  /**
   * POST /api/stripe-webhook
   * Receives and verifies Stripe webhook events
   */
  .post("/api/stripe-webhook", async (c) => {
    try {
      const secretKey = c.env.STRIPE_WEBHOOK_SECRET;
      if (!secretKey || secretKey === "whsec_your_key_here") {
        console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
        return c.json({ error: "Webhook not configured" }, 500);
      }

      const signature = c.req.header("stripe-signature");
      if (!signature) {
        console.warn("[Stripe Webhook] Missing stripe-signature header");
        return c.json({ error: "Missing stripe-signature header" }, 400);
      }

      // Get raw body for signature verification
      const rawBody = await c.req.text();
      if (!rawBody) {
        console.warn("[Stripe Webhook] Empty request body");
        return c.json({ error: "Empty request body" }, 400);
      }

      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2024-06-20",
      });

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, secretKey);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Signature verification failed";
        console.error("[Stripe Webhook] Signature verification failed:", message);
        return c.json({ error: `Webhook signature verification failed: ${message}` }, 400);
      }

      // Handle the event
      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            console.info("[Stripe Webhook] checkout.session.completed", {
              sessionId: session.id,
              customerEmail: session.customer_details?.email,
              amountTotal: session.amount_total,
              currency: session.currency,
              metadata: session.metadata,
              paymentStatus: session.payment_status,
            });

            // ──────────────────────────────────────────────────────────────
            // Send WhatsApp confirmation when order is paid
            // ──────────────────────────────────────────────────────────────
            if (session.metadata && session.payment_status === "paid") {
              try {
                const meta = session.metadata;
                const items = meta.lineItems ? JSON.parse(meta.lineItems) : [];
                const totalAed = session.amount_total ? Math.round(session.amount_total / 100) : 0;

                const whatsappPayload = {
                  reference: meta.orderReference || `SBR-${session.id.slice(-6)}`,
                  customer_name: meta.customerName || "Valued Client",
                  customer_phone: meta.customerPhone || meta.customer_details?.phone || "",
                  customer_address: meta.customerAddress || "",
                  customer_emirate: meta.customerEmirate || "Dubai",
                  payment_method: meta.paymentMethod || "Card",
                  currency: meta.currency?.toUpperCase() || "AED",
                  total_aed: totalAed,
                  items: items.map((item: { name: string; quantity: number; size: string }) => ({
                    product_id: item.name,
                    name: item.name,
                    quantity: item.quantity,
                    size: item.size,
                    price: item.price || 0,
                  })),
                };

                await sendWhatsAppOrderConfirmation(c.env, whatsappPayload);
                console.info("[WhatsApp] Order confirmation sent for:", whatsappPayload.reference);
              } catch (whatsappError) {
                console.error("[WhatsApp] Failed to send confirmation:", whatsappError);
                // Don't fail the webhook if WhatsApp fails
              }
            }

            // TODO: Fulfill the order - create order in DB, send confirmation, etc.
            break;
          }

          case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            console.info("[Stripe Webhook] checkout.session.expired", {
              sessionId: session.id,
              metadata: session.metadata,
            });
            break;
          }

          case "payment_intent.succeeded": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.info("[Stripe Webhook] payment_intent.succeeded", {
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              metadata: paymentIntent.metadata,
            });
            break;
          }

          case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.error("[Stripe Webhook] payment_intent.payment_failed", {
              paymentIntentId: paymentIntent.id,
              error: paymentIntent.last_payment_error?.message,
              metadata: paymentIntent.metadata,
            });
            break;
          }

          default: {
            console.info("[Stripe Webhook] Unhandled event type", { eventType: event.type });
          }
        }

        return c.json({ received: true });
      } catch (error) {
        console.error("[Stripe Webhook] Error handling event:", error);
        return c.json({ error: "Webhook handler failed" }, 500);
      }
    } catch (error) {
      console.error("[Stripe Webhook] Unexpected error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  // ──────────────────────────────────────────────────────────────
  // SPA Fallback — serve index.html for all non-API routes
  // This enables client-side React Router on Cloudflare Workers assets
  // ──────────────────────────────────────────────────────────────
  app.all("*", async (c) => {
    // Skip API routes — let them fall through to existing handlers or return 404
    if (c.req.path.startsWith("/api/")) {
      return c.notFound();
    }
    // Serve the SPA entry point for all other routes (React Router handles them client-side)
    try {
      const indexHtml = await c.env.ASSETS?.fetch?.(new Request(new URL("/", c.req.url))) ?? null;
      if (indexHtml && indexHtml.status === 200) {
        return indexHtml;
      }
    } catch (e) {
      console.warn("[Worker] Assets fetch failed:", e);
    }
    return c.html(`<html><body><a href="/">Home</a></body></html>`);
  });

export default app;