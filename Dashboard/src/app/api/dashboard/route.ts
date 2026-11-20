import { NextResponse } from "next/server";
import { fetchOrders, fetchProducts, fetchCustomers } from "@/lib/supabase-data";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  REVENUE_CHART_DATA,
  EMIRATE_DISTRIBUTION_BASE,
} from "@/lib/seed-data";
import { updateOrderStatus } from "@/lib/supabase-data";

export async function GET() {
  try {
    const [products, orders, customers] = await Promise.all([
      fetchProducts(),
      fetchOrders(),
      fetchCustomers(),
    ]);

    return NextResponse.json({
      products: products.length ? products : INITIAL_PRODUCTS,
      orders: orders.length ? orders : INITIAL_ORDERS,
      customers: customers.length ? customers : INITIAL_CUSTOMERS,
      settings: {
        id: 1,
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
      },
      revenueChartData: REVENUE_CHART_DATA,
      emirateBase: EMIRATE_DISTRIBUTION_BASE,
    });
  } catch (error) {
    console.error("Error in GET /api/dashboard:", error);
    return NextResponse.json({
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      customers: INITIAL_CUSTOMERS,
      settings: {
        id: 1,
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
      },
      revenueChartData: REVENUE_CHART_DATA,
      emirateBase: EMIRATE_DISTRIBUTION_BASE,
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, notes, courierService } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const result = await updateOrderStatus(id, { status, notes, courierService });

    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Failed to update order" }, { status: 500 });
    }

    const updatedOrder = (await fetchOrders()).find((o) => o.id === id);
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error in PATCH /api/dashboard:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}