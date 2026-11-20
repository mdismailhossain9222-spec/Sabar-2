import { db, pool } from "@/db";
import { products, orders, customers, atelierSettings } from "@/db/schema";
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOMERS } from "./seed-data";
import { count } from "drizzle-orm";

let initialized = false;

export async function ensureDbSeeded() {
  if (initialized) return;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        collection TEXT NOT NULL,
        category TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        stock_status TEXT NOT NULL DEFAULT 'In Stock',
        image TEXT NOT NULL,
        fabric TEXT NOT NULL,
        sizes JSONB NOT NULL DEFAULT '["S","M","L"]'::jsonb,
        description TEXT NOT NULL,
        featured BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        emirate TEXT NOT NULL,
        address TEXT NOT NULL,
        vip_tier TEXT NOT NULL DEFAULT 'Atelier Member',
        total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0,
        orders_count INTEGER NOT NULL DEFAULT 0,
        preferred_size TEXT NOT NULL DEFAULT 'M',
        notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        emirate TEXT NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        payment_method TEXT NOT NULL DEFAULT 'Apple Pay •••• 8842',
        courier_service TEXT NOT NULL DEFAULT 'Sabr White-Glove Chauffeur',
        notes TEXT NOT NULL DEFAULT '',
        items JSONB NOT NULL,
        order_date TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS atelier_settings (
        id SERIAL PRIMARY KEY,
        maison_name TEXT NOT NULL DEFAULT 'Sabr By Simran',
        creative_director TEXT NOT NULL DEFAULT 'Simran Kaur',
        atelier_location TEXT NOT NULL DEFAULT 'Villa 14, Al Wasl Road, Jumeirah 1, Dubai, UAE',
        concierge_email TEXT NOT NULL DEFAULT 'privé@sabrbysimran.ae',
        concierge_phone TEXT NOT NULL DEFAULT '+971 4 589 2400',
        currency TEXT NOT NULL DEFAULT 'AED',
        complimentary_chauffeur_threshold INTEGER NOT NULL DEFAULT 3000,
        low_stock_threshold INTEGER NOT NULL DEFAULT 5,
        vip_auto_upgrade_threshold INTEGER NOT NULL DEFAULT 15000,
        enable_whatsapp_concierge BOOLEAN NOT NULL DEFAULT true,
        enable_bespoke_measurements BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    const [{ value: productCount }] = await db.select({ value: count() }).from(products);
    if (productCount === 0) {
      for (const p of INITIAL_PRODUCTS) {
        await db
          .insert(products)
          .values({
            sku: p.sku,
            name: p.name,
            collection: p.collection,
            category: p.category,
            price: String(p.price),
            stock: p.stock,
            stockStatus: p.stockStatus,
            image: p.image,
            fabric: p.fabric,
            sizes: p.sizes,
            description: p.description,
            featured: p.featured,
          })
          .onConflictDoNothing();
      }
    }

    const [{ value: orderCount }] = await db.select({ value: count() }).from(orders);
    if (orderCount === 0) {
      for (const o of INITIAL_ORDERS) {
        await db
          .insert(orders)
          .values({
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            customerEmail: o.customerEmail,
            customerPhone: o.customerPhone,
            shippingAddress: o.shippingAddress,
            emirate: o.emirate,
            totalAmount: String(o.totalAmount),
            status: o.status,
            paymentMethod: o.paymentMethod,
            courierService: o.courierService,
            notes: o.notes,
            items: o.items,
            orderDate: new Date(o.orderDate),
          })
          .onConflictDoNothing();
      }
    }

    const [{ value: customerCount }] = await db.select({ value: count() }).from(customers);
    if (customerCount === 0) {
      for (const c of INITIAL_CUSTOMERS) {
        await db
          .insert(customers)
          .values({
            name: c.name,
            email: c.email,
            phone: c.phone,
            emirate: c.emirate,
            address: c.address,
            vipTier: c.vipTier,
            totalSpent: String(c.totalSpent),
            ordersCount: c.ordersCount,
            preferredSize: c.preferredSize,
            notes: c.notes,
          })
          .onConflictDoNothing();
      }
    }

    const [{ value: settingsCount }] = await db.select({ value: count() }).from(atelierSettings);
    if (settingsCount === 0) {
      await db.insert(atelierSettings).values({
        maisonName: "Sabr By Simran",
        creativeDirector: "Simran Kaur",
        atelierLocation: "Villa 14, Al Wasl Road, Jumeirah 1, Dubai, UAE",
        conciergeEmail: "prive@sabrbysimran.ae",
        conciergePhone: "+971 4 589 2400",
        currency: "AED",
        complimentaryChauffeurThreshold: 3000,
        lowStockThreshold: 5,
        vipAutoUpgradeThreshold: 15000,
        enableWhatsAppConcierge: true,
        enableBespokeMeasurements: true,
      });
    }

    initialized = true;
  } catch (err) {
    console.error("Database initialization fallback warning:", err);
  }
}
