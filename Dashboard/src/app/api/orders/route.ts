import { NextRequest, NextResponse } from "next/server";
import { fetchOrders, updateOrderStatus } from "@/lib/supabase-data";
import { INITIAL_ORDERS } from "@/lib/seed-data";
import type { OrderStatus } from "@/components/dashboard/types";

export async function GET() {
  try {
    const orders = await fetchOrders();
    return NextResponse.json({ orders: orders.length ? orders : INITIAL_ORDERS });
  } catch (error) {
    console.error("Error in GET /api/orders:", error);
    return NextResponse.json({ orders: INITIAL_ORDERS });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes, courierService } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const result = await updateOrderStatus(id, {
      status: status as OrderStatus | undefined,
      notes,
      courierService,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Failed to update order" }, { status: 500 });
    }

    const updatedOrder = (await fetchOrders()).find((o) => o.id === id);
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error in PATCH /api/orders:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const randomSuffix = Math.floor(9483 + Math.random() * 500);
    const orderNumber = body.orderNumber || `SBS-${randomSuffix}`;

    // Mock create for now (orders go to Supabase via main website checkout)
    return NextResponse.json({
      order: {
        id: Date.now(),
        orderNumber,
        customerName: body.customerName,
        customerEmail: body.customerEmail || "client@prive.ae",
        customerPhone: body.customerPhone || "+971 50 000 0000",
        shippingAddress: body.shippingAddress || "Jumeirah 1, Dubai, UAE",
        emirate: body.emirate || "Dubai",
        totalAmount: Number(body.totalAmount || 0),
        status: body.status || "Pending",
        paymentMethod: body.paymentMethod || "Amex Centurion •••• 1004",
        courierService: body.courierService || "Sabr White-Glove Chauffeur",
        notes: body.notes || "",
        items: body.items || [],
        orderDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in POST /api/orders:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}