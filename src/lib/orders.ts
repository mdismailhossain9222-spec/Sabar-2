/**
 * Supabase order placement service.
 *
 * Falls back to localStorage when Supabase is not configured,
 * so the app works offline / before DB setup is complete.
 */
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { CurrencyCode, PlaceOrderInput, SupabaseOrderRow } from "@/data/shop";

export type OrderResult =
  | { ok: true; reference: string; orderId: string }
  | { ok: false; error: string };

let pendingOrderId = 0; // fallback monotonically-increasing id

async function placeOrderViaSupabase(input: PlaceOrderInput): Promise<OrderResult> {
  const client = getSupabaseClient();
  const reference = `SBR-${String(Date.now()).slice(-6)}`;

  const itemsJson = input.items.map((item) => ({
    product_id: item.productId,
    name: item.name,
    quantity: item.quantity,
    size: item.size,
  }));

  const { data, error } = await client.from("orders").insert({
    reference,
    customer_name: input.fullName.trim(),
    customer_phone: input.phone.trim(),
    customer_address: input.address.trim(),
    customer_emirate: input.emirate,
    payment_method: input.paymentMethod,
    currency: input.currency,
    total_aed: input.totalAed,
    status: "pending" as const,
    items_json: itemsJson,
  }).select().single();

  if (error) {
    console.error("[Supabase] Order insert failed:", error.message);
    return { ok: false, error: error.message };
  }

  const row = data as unknown as SupabaseOrderRow;
  return { ok: true, reference, orderId: row.id };
}

async function placeOrderFallback(input: PlaceOrderInput): Promise<OrderResult> {
  // Persist to localStorage so orders are visible during dev
  try {
    const stored = JSON.parse(localStorage.getItem("sabr-orders-v1") ?? "[]") as SupabaseOrderRow[];
    const reference = `SBR-${String(Date.now()).slice(-6)}`;
    const order: SupabaseOrderRow = {
      id: `fb-${++pendingOrderId}`,
      reference,
      customer_name: input.fullName.trim(),
      customer_phone: input.phone.trim(),
      customer_address: input.address.trim(),
      customer_emirate: input.emirate,
      payment_method: input.paymentMethod,
      currency: input.currency,
      total_aed: input.totalAed,
      status: "pending",
      items_json: input.items,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem("sabr-orders-v1", JSON.stringify([...stored, order]));
    return { ok: true, reference, orderId: order.id };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Place an order via Supabase, with a graceful local fallback.
 * Returns the reference code and internal order ID on success.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<OrderResult> {
  if (isSupabaseConfigured()) {
    return placeOrderViaSupabase(input);
  }
  return placeOrderFallback(input);
}
