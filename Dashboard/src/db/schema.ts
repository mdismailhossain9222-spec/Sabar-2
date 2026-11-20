import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

export interface OrderItem {
  productId: number;
  name: string;
  sku: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
  fabric?: string;
}

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  collection: text("collection").notNull(),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  stockStatus: text("stock_status").notNull().default("In Stock"), // "In Stock" | "Low Stock" | "Sold Out"
  image: text("image").notNull(),
  fabric: text("fabric").notNull(),
  sizes: jsonb("sizes").$type<string[]>().notNull().default(["S", "M", "L"]),
  description: text("description").notNull(),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  emirate: text("emirate").notNull(),
  address: text("address").notNull(),
  vipTier: text("vip_tier").notNull().default("Atelier Member"), // "Couture Privé" | "Gold Circle" | "Atelier Member"
  totalSpent: numeric("total_spent", { precision: 12, scale: 2 }).notNull().default("0"),
  ordersCount: integer("orders_count").notNull().default(0),
  preferredSize: text("preferred_size").notNull().default("M"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  emirate: text("emirate").notNull(), // "Dubai" | "Abu Dhabi" | "Sharjah" | "Ras Al Khaimah" | "Ajman" | "Fujairah"
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("Pending"), // "Pending" | "Shipped" | "Delivered"
  paymentMethod: text("payment_method").notNull().default("Apple Pay •••• 8842"),
  courierService: text("courier_service").notNull().default("Sabr White-Glove Chauffeur"),
  notes: text("notes").notNull().default(""),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
});

export const atelierSettings = pgTable("atelier_settings", {
  id: serial("id").primaryKey(),
  maisonName: text("maison_name").notNull().default("Sabr By Simran"),
  creativeDirector: text("creative_director").notNull().default("Simran Kaur"),
  atelierLocation: text("atelier_location").notNull().default("Villa 14, Al Wasl Road, Jumeirah 1, Dubai, UAE"),
  conciergeEmail: text("concierge_email").notNull().default("privé@sabrbysimran.ae"),
  conciergePhone: text("concierge_phone").notNull().default("+971 4 589 2400"),
  currency: text("currency").notNull().default("AED"),
  complimentaryChauffeurThreshold: integer("complimentary_chauffeur_threshold").notNull().default(3000),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  vipAutoUpgradeThreshold: integer("vip_auto_upgrade_threshold").notNull().default(15000),
  enableWhatsAppConcierge: boolean("enable_whatsapp_concierge").notNull().default(true),
  enableBespokeMeasurements: boolean("enable_bespoke_measurements").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
