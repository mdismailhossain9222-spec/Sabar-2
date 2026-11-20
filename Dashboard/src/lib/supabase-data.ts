/**
 * Dashboard Supabase data layer.
 * Reads `orders` and `products` from the shared Supabase database.
 * Falls back to seed data when Supabase is not configured (e.g. local preview).
 */
import { supabase, isSupabaseConfigured } from "./supabase";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
} from "./seed-data";
import type {
  DashboardCustomer,
  DashboardOrder,
  DashboardProduct,
  EmirateName,
  OrderStatus,
} from "@/components/dashboard/types";

// ──────────────────────────────────────────────────────────────
// Mappers: Supabase snake_case rows → Dashboard camelCase models
// ──────────────────────────────────────────────────────────────

interface SupabaseOrderRow {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_emirate: string;
  payment_method: string;
  currency: string;
  total_aed: number;
  status: string;
  items_json: Array<{
    product_id: string;
    name: string;
    quantity: number;
    size: string;
    price?: number;
  }>;
  created_at: string;
}

interface SupabaseProductRow {
  id: string;
  name: string;
  price: number;
  category: string;
  colour: string;
  image: string;
  note: string;
  description: string;
  sizes: string[];
  badge?: string | null;
  microcopy?: string | null;
}

function mapOrder(row: SupabaseOrderRow, index: number): DashboardOrder {
  const items = (row.items_json || []).map((item, i) => ({
    productId: Number(item.product_id) || index,
    name: item.name,
    sku: item.product_id,
    size: item.size,
    quantity: item.quantity,
    price: item.price ?? Math.round(row.total_aed / Math.max(1, item.quantity)),
    image: "/images/garment-1.jpg",
  }));

  return {
    id: index,
    orderNumber: row.reference,
    customerName: row.customer_name,
    customerEmail: `${row.customer_phone}@sabr.ae`, // Supabase orders don't collect email
    customerPhone: row.customer_phone,
    shippingAddress: row.customer_address,
    emirate: (row.customer_emirate as EmirateName) || "Dubai",
    totalAmount: Number(row.total_aed),
    status: (row.status.charAt(0).toUpperCase() + row.status.slice(1)) as OrderStatus,
    paymentMethod: row.payment_method,
    courierService: "Sabr White-Glove Chauffeur",
    notes: "",
    items,
    orderDate: row.created_at,
  };
}

function mapProduct(row: SupabaseProductRow, index: number): DashboardProduct {
  return {
    id: index,
    sku: row.id,
    name: row.name,
    collection: "SS26 — Daisy Dreams",
    category: row.category,
    price: Number(row.price),
    stock: 10,
    stockStatus: "In Stock",
    image: row.image,
    fabric: row.note || "Hand-finished in Dubai",
    sizes: row.sizes || ["S", "M", "L"],
    description: row.description || row.note,
    featured: Boolean(row.badge),
  };
}

// ──────────────────────────────────────────────────────────────
// Fetch all orders (most recent first)
// ──────────────────────────────────────────────────────────────

export async function fetchOrders(): Promise<DashboardOrder[]> {
  if (!isSupabaseConfigured()) return INITIAL_ORDERS as unknown as DashboardOrder[];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] fetchOrders failed:", error.message);
    return INITIAL_ORDERS as unknown as DashboardOrder[];
  }

  return (data || []).map(mapOrder);
}

// ──────────────────────────────────────────────────────────────
// Fetch all products
// ──────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<DashboardProduct[]> {
  if (!isSupabaseConfigured()) return INITIAL_PRODUCTS as unknown as DashboardProduct[];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] fetchProducts failed:", error.message);
    return INITIAL_PRODUCTS as unknown as DashboardProduct[];
  }

  return (data || []).map(mapProduct);
}

// ──────────────────────────────────────────────────────────────
// Update order status
// ──────────────────────────────────────────────────────────────

export async function updateOrderStatus(
  id: number,
  updates: { status?: OrderStatus; notes?: string; courierService?: string }
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase not configured" };
  }

  const updateData: Record<string, string> = {};
  if (updates.status) {
    updateData.status = updates.status.toLowerCase();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("orders")
    .update(updateData)
    .eq("reference", String(id));

  if (error) {
    console.error("[Supabase] updateOrderStatus failed:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// ──────────────────────────────────────────────────────────────
// Fetch customers (derived from orders — we don't have a customers table)
// ──────────────────────────────────────────────────────────────

export async function fetchCustomers(): Promise<DashboardCustomer[]> {
  if (!isSupabaseConfigured()) return INITIAL_CUSTOMERS as unknown as DashboardCustomer[];

  const orders = await fetchOrders();
  const seen = new Map<string, DashboardCustomer>();

  for (const order of orders) {
    if (!seen.has(order.customerName)) {
      seen.set(order.customerName, {
        id: seen.size,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        emirate: order.emirate,
        address: order.shippingAddress,
        vipTier: "Atelier Member",
        totalSpent: order.totalAmount,
        ordersCount: 1,
        preferredSize: "M",
        notes: "",
      });
    } else {
      const existing = seen.get(order.customerName)!;
      existing.totalSpent += order.totalAmount;
      existing.ordersCount += 1;
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}
