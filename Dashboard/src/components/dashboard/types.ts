import type { OrderItem } from "@/db/schema";

export type NavTab = "overview" | "orders" | "products" | "customers" | "settings";

export type EmirateName =
  | "Dubai"
  | "Abu Dhabi"
  | "Sharjah"
  | "Ras Al Khaimah"
  | "Ajman"
  | "Fujairah";

export type OrderStatus = "Pending" | "Shipped" | "Delivered";

export type StockStatus = "In Stock" | "Low Stock" | "Sold Out";

export interface DashboardProduct {
  id: number;
  sku: string;
  name: string;
  collection: string;
  category: string;
  price: number;
  stock: number;
  stockStatus: StockStatus;
  image: string;
  fabric: string;
  sizes: string[];
  description: string;
  featured: boolean;
}

export interface DashboardOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  emirate: EmirateName;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  courierService: string;
  notes: string;
  items: OrderItem[];
  orderDate: string;
}

export interface DashboardCustomer {
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

export interface AtelierSettingsData {
  id?: number;
  maisonName: string;
  creativeDirector: string;
  atelierLocation: string;
  conciergeEmail: string;
  conciergePhone: string;
  currency: string;
  complimentaryChauffeurThreshold: number;
  lowStockThreshold: number;
  vipAutoUpgradeThreshold: number;
  enableWhatsAppConcierge: boolean;
  enableBespokeMeasurements: boolean;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface EmirateDistributionItem {
  emirate: string;
  orders: number;
  revenue: number;
  share: number;
  color: string;
}
