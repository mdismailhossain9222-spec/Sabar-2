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
  /** Short product-summary line used on the collection card. */
  note: string;
  /** Longer editorial description used in the product detail view. */
  description: string;
  sizes: string[];
  badge?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "black-swan",
    name: "The Black Swan",
    price: 450,
    category: "Eveningwear",
    colour: "Noir silk",
    image: "/The Black Swan.png",
    imageAlt: "The Black Swan — sculptural black satin evening dress",
    note: "Bias-cut liquid satin with a hand-draped neckline.",
    description:
      "Our signature after-dark silhouette, cut on the bias so the satin moves with you. A hand-draped neckline and open back keep the line sculptural, never severe.",
    sizes: ["S", "M", "L", "XL"],
    badge: "Signature",
  },
  {
    id: "eclat",
    name: "The Éclat",
    price: 380,
    category: "Occasion",
    colour: "Blush satin",
    image: "/The Éclat.png",
    imageAlt: "The Éclat — blush pink satin column dress with a shoulder bow",
    note: "A soft rose column, finished with a sculptural bow.",
    description:
      "A quiet entrance piece in blush satin. The column cut skims rather than clings, while an asymmetric shoulder bow gives The Éclat its soft, unmistakable presence.",
    sizes: ["S", "M", "L", "XL"],
    badge: "New in",
  },
  {
    id: "espresso",
    name: "The Espresso",
    price: 520,
    category: "Tailoring",
    colour: "Espresso",
    image: "/The Espresso.png",
    imageAlt: "The Espresso — chocolate brown tailored blazer and wide-leg trousers",
    note: "Sharp, feminine tailoring in a warm chocolate palette.",
    description:
      "A modern two-piece in deep chocolate. The single-breasted blazer is nipped at the waist and paired with a fluid wide-leg trouser — boardroom sharp, entirely feminine.",
    sizes: ["S", "M", "L", "XL"],
    badge: "Limited",
  },
  {
    id: "coco",
    name: "The Coco",
    price: 410,
    category: "Tweed",
    colour: "Crème bouclé",
    image: "/The Coco.png",
    imageAlt: "The Coco — cream bouclé tweed jacket and skirt set with gold buttons",
    note: "Cream bouclé and pearl detailing, made to be kept.",
    description:
      "A heirloom set in cream bouclé tweed, finished with pearl buttons and a softly structured shoulder. Designed to be worn together for occasions, or apart for every day.",
    sizes: ["S", "M", "L", "XL"],
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

/** Stable identity for a size-specific cart line. */
export function cartLineKey(productId: string, size: string) {
  return `${productId}::${size}`;
}
