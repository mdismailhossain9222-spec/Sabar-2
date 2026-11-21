import type { OrderItem } from "@/components/dashboard/types";

export interface SeedProduct {
  id: number;
  sku: string;
  name: string;
  collection: string;
  category: string;
  price: number;
  stock: number;
  stockStatus: "In Stock" | "Low Stock" | "Sold Out";
  image: string;
  fabric: string;
  sizes: string[];
  description: string;
  featured: boolean;
}

export interface SeedOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  emirate: "Dubai" | "Abu Dhabi" | "Sharjah" | "Ras Al Khaimah" | "Ajman" | "Fujairah";
  totalAmount: number;
  status: "Pending" | "Shipped" | "Delivered";
  paymentMethod: string;
  courierService: string;
  notes: string;
  items: OrderItem[];
  orderDate: string; // ISO date string
}

export interface SeedCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  emirate: string;
  address: string;
  vipTier: "Couture Privé" | "Gold Circle" | "Atelier Member";
  totalSpent: number;
  ordersCount: number;
  preferredSize: string;
  notes: string;
}

export const INITIAL_PRODUCTS: SeedProduct[] = [
  {
    id: 1,
    sku: "black-swan",
    name: "The Black Swan",
    collection: "SS26 — Daisy Dreams",
    category: "Eveningwear",
    price: 1000,
    stock: 10,
    stockStatus: "In Stock",
    image: "/The Black Swan.png",
    fabric: "Bias-cut liquid satin with a hand-draped neckline.",
    sizes: ["S", "M", "L", "XL"],
    description:
      "Our signature after-dark silhouette, cut on the bias so the satin moves with you. A hand-draped neckline and open back keep the line sculptural, never severe.",
    featured: true,
  },
  {
    id: 2,
    sku: "eclat",
    name: "The Éclat",
    collection: "SS26 — Daisy Dreams",
    category: "Occasion",
    price: 800,
    stock: 8,
    stockStatus: "In Stock",
    image: "/The Éclat.png",
    fabric: "A soft rose column, finished with a sculptural bow.",
    sizes: ["S", "M", "L", "XL"],
    description:
      "A quiet entrance piece in blush satin. The column cut skims rather than clings, while an asymmetric shoulder bow gives The Éclat its soft, unmistakable presence.",
    featured: true,
  },
  {
    id: 3,
    sku: "espresso",
    name: "The Espresso",
    collection: "SS26 — Daisy Dreams",
    category: "Tailoring",
    price: 1500,
    stock: 5,
    stockStatus: "In Stock",
    image: "/The Espresso.png",
    fabric: "Sharp, feminine tailoring in a warm chocolate palette.",
    sizes: ["S", "M", "L", "XL"],
    description:
      "A modern two-piece in deep chocolate. The single-breasted blazer is nipped at the waist and paired with a fluid wide-leg trouser — boardroom sharp, entirely feminine.",
    featured: true,
  },
  {
    id: 4,
    sku: "coco",
    name: "The Coco",
    collection: "SS26 — Daisy Dreams",
    category: "Tweed",
    price: 1800,
    stock: 3,
    stockStatus: "Low Stock",
    image: "/The Coco.png",
    fabric: "Cream bouclé and pearl detailing, made to be kept.",
    sizes: ["S", "M", "L", "XL"],
    description:
      "A heirloom set in cream bouclé tweed, finished with pearl buttons and a softly structured shoulder. Designed to be worn together for occasions, or apart for every day.",
    featured: false,
  },
];

export const INITIAL_ORDERS: SeedOrder[] = [
  {
    id: 1,
    orderNumber: "SBR-001",
    customerName: "Test Customer",
    customerEmail: "test@example.com",
    customerPhone: "+971 50 123 4567",
    shippingAddress: "Test Villa, Dubai",
    emirate: "Dubai",
    totalAmount: 1000,
    status: "Pending",
    paymentMethod: "Cash on Delivery",
    courierService: "Sabr White-Glove Chauffeur",
    notes: "",
    items: [],
    orderDate: new Date().toISOString(),
  },
];

export const INITIAL_CUSTOMERS: SeedCustomer[] = [
  {
    id: 1,
    name: "Test Customer",
    email: "test@example.com",
    phone: "+971 50 123 4567",
    emirate: "Dubai",
    address: "Test Villa, Dubai",
    vipTier: "Atelier Member",
    totalSpent: 1000,
    ordersCount: 1,
    preferredSize: "M",
    notes: "",
  },
];

export const REVENUE_CHART_DATA = {
  "7D": [
    { label: "Mon", revenue: 0, orders: 0, aov: 0 },
    { label: "Tue", revenue: 0, orders: 0, aov: 0 },
    { label: "Wed", revenue: 0, orders: 0, aov: 0 },
    { label: "Thu", revenue: 0, orders: 0, aov: 0 },
    { label: "Fri", revenue: 0, orders: 0, aov: 0 },
    { label: "Sat", revenue: 0, orders: 0, aov: 0 },
    { label: "Sun", revenue: 0, orders: 0, aov: 0 },
  ],
  "30D": [
    { label: "Week 1", revenue: 0, orders: 0, aov: 0 },
    { label: "Week 2", revenue: 0, orders: 0, aov: 0 },
    { label: "Week 3", revenue: 0, orders: 0, aov: 0 },
    { label: "Week 4", revenue: 0, orders: 0, aov: 0 },
  ],
  "90D": [
    { label: "Month 1", revenue: 0, orders: 0, aov: 0 },
    { label: "Month 2", revenue: 0, orders: 0, aov: 0 },
    { label: "Month 3", revenue: 0, orders: 0, aov: 0 },
  ],
  "12M": [
    { label: "Jan", revenue: 0, orders: 0, aov: 0 },
    { label: "Feb", revenue: 510000, orders: 92, aov: 5543 },
    { label: "Mar", revenue: 680000, orders: 118, aov: 5762 },
    { label: "Apr", revenue: 790000, orders: 135, aov: 5851 },
    { label: "May", revenue: 920000, orders: 158, aov: 5822 },
    { label: "Jun", revenue: 1050000, orders: 182, aov: 5769 },
    { label: "Jul", revenue: 1180000, orders: 204, aov: 5784 },
    { label: "Aug", revenue: 1280000, orders: 221, aov: 5791 },
    { label: "Sep", revenue: 1420000, orders: 245, aov: 5796 },
    { label: "Oct", revenue: 1580000, orders: 272, aov: 5808 },
    { label: "Nov", revenue: 1720000, orders: 298, aov: 5771 },
    { label: "Dec", revenue: 1890000, orders: 324, aov: 5833 },
  ],
};

export const EMIRATE_DISTRIBUTION_BASE = [
  { emirate: "Dubai", orders: 142, revenue: 985000, share: 48.2, color: "#E87272" },
  { emirate: "Abu Dhabi", orders: 78, revenue: 524000, share: 25.6, color: "#D4AF37" },
  { emirate: "Sharjah", orders: 34, revenue: 218000, share: 10.6, color: "#9E2A3B" },
  { emirate: "Ras Al Khaimah", orders: 18, revenue: 112000, share: 5.5, color: "#C4B5A6" },
  { emirate: "Ajman", orders: 12, revenue: 78000, share: 3.8, color: "#6E2530" },
  { emirate: "Fujairah", orders: 11, revenue: 68000, share: 3.3, color: "#4A0E17" },
];