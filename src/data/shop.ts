export type CurrencyCode = "AED" | "USD" | "GBP" | "EUR";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  rate: number;
  label: string;
};

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  AED: { code: "AED", symbol: "AED", rate: 1, label: "UAE Dirham" },
  USD: { code: "USD", symbol: "$", rate: 0.2723, label: "US Dollar" },
  GBP: { code: "GBP", symbol: "£", rate: 0.2117, label: "Pound Sterling" },
  EUR: { code: "EUR", symbol: "€", rate: 0.2491, label: "Euro" },
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  colour: string;
  image: string;
  imageAlt: string;
  /** Native pixel width of the source image, used for CLS-free <img> tags. */
  imageWidth: number;
  /** Native pixel height of the source image, used for CLS-free <img> tags. */
  imageHeight: number;
  /** Short product-summary line used on the collection card. */
  note: string;
  /** Minimal editorial caption rendered as a small badge on the collection card. */
  microcopy?: string;
  /** Longer editorial description used in the product detail view. */
  description: string;
  sizes: string[];
  badge?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "black-swan",
    name: "The Black Swan",
    price: 1000,
    category: "Eveningwear",
    colour: "Noir silk",
    image: "/The Black Swan.png",
    imageAlt: "The Black Swan — sculptural black satin evening dress",
    imageWidth: 1180,
    imageHeight: 1600,
    note: "Bias-cut liquid satin with a hand-draped neckline.",
    description:
      "Our signature after-dark silhouette, cut on the bias so the satin moves with you. A hand-draped neckline and open back keep the line sculptural, never severe.",
    sizes: ["S", "M", "L", "XL"],
    badge: "Signature",
    microcopy: "A silhouette of its own",
  },
  {
    id: "eclat",
    name: "The Éclat",
    price: 800,
    category: "Occasion",
    colour: "Blush satin",
    image: "/The Éclat.png",
    imageAlt: "The Éclat — blush pink satin column dress with a shoulder bow",
    imageWidth: 1200,
    imageHeight: 1600,
    note: "A soft rose column, finished with a sculptural bow.",
    description:
      "A quiet entrance piece in blush satin. The column cut skims rather than clings, while an asymmetric shoulder bow gives The Éclat its soft, unmistakable presence.",
    sizes: ["S", "M", "L", "XL"],
    badge: "New in",
    microcopy: "The new feminine",
  },
  {
    id: "espresso",
    name: "The Espresso",
    price: 1500,
    category: "Tailoring",
    colour: "Espresso",
    image: "/The Espresso.png",
    imageAlt: "The Espresso — chocolate brown tailored blazer and wide-leg trousers",
    imageWidth: 1200,
    imageHeight: 1600,
    note: "Sharp, feminine tailoring in a warm chocolate palette.",
    description:
      "A modern two-piece in deep chocolate. The single-breasted blazer is nipped at the waist and paired with a fluid wide-leg trouser — boardroom sharp, entirely feminine.",
    sizes: ["S", "M", "L", "XL"],
    badge: "Limited",
    microcopy: "The details do the talking",
  },
  {
    id: "coco",
    name: "The Coco",
    price: 1800,
    category: "Tweed",
    colour: "Crème bouclé",
    image: "/The Coco.png",
    imageAlt: "The Coco — cream bouclé tweed jacket and skirt set with gold buttons",
    imageWidth: 1200,
    imageHeight: 1600,
    note: "Cream bouclé and pearl detailing, made to be kept.",
    description:
      "A heirloom set in cream bouclé tweed, finished with pearl buttons and a softly structured shoulder. Designed to be worn together for occasions, or apart for every day.",
    sizes: ["S", "M", "L", "XL"],
    microcopy: "An edit worth remembering",
  },
];

export function formatMoney(amountAed: number, currencyCode: CurrencyCode) {
  const currency = CURRENCIES[currencyCode];
  const value = Math.round(amountAed * currency.rate);
  const formatted = new Intl.NumberFormat("en-AE", {
    maximumFractionDigits: 0,
  }).format(value);
  return currency.symbol === "$" || currency.symbol === "£" || currency.symbol === "€"
    ? `${currency.symbol}${formatted}`
    : `${currency.symbol} ${formatted}`;
}

export type CartLine = {
  productId: string;
  size: string;
  quantity: number;
};

export function cartLineKey(productId: string, size: string) {
  return `${productId}::${size}`;
}

// ──────────────────────────────────────────────────────────────
// Supabase order types & service
// ──────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

export type SupabaseOrderRow = {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_emirate: string;
  payment_method: string;
  currency: string;
  total_aed: number;
  status: OrderStatus;
  items_json: unknown;
  created_at: string;
};

export type PlaceOrderInput = {
  fullName: string;
  phone: string;
  address: string;
  emirate: string;
  paymentMethod: string;
  currency: CurrencyCode;
  totalAed: number;
  items: Array<{ productId: string; name: string; quantity: number; size: string }>;
};

// ──────────────────────────────────────────────────────────────
// Dynamic product catalog — fetches from Supabase if configured
// Falls back to static PRODUCTS if DB is empty or not set up
// ──────────────────────────────────────────────────────────────

interface SupabaseProductRow {
  id: string;
  name: string;
  price: number;
  category: string;
  colour: string;
  image: string;
  "imageAlt": string;
  "imageWidth": number;
  "imageHeight": number;
  note: string;
  microcopy?: string;
  description: string;
  sizes: string[];
  badge?: string;
}

async function fetchProductsFromSupabase(): Promise<Product[]> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      return [];
    }

    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((row: SupabaseProductRow) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price),
      category: row.category,
      colour: row.colour,
      image: row.image,
      imageAlt: row["imageAlt"],
      imageWidth: row["imageWidth"] || 1200,
      imageHeight: row["imageHeight"] || 1600,
      note: row.note,
      microcopy: row.microcopy,
      description: row.description,
      sizes: row.sizes || ['S', 'M', 'L'],
      badge: row.badge,
    }));
  } catch {
    return [];
  }
}

let _cachedProducts: Product[] | null = null;

export async function getProducts(): Promise<Product[]> {
  if (_cachedProducts !== null) return _cachedProducts;

  const supabaseProducts = await fetchProductsFromSupabase();
  _cachedProducts = supabaseProducts.length > 0 ? supabaseProducts : PRODUCTS;
  return _cachedProducts;
}
