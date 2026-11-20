import { NextRequest, NextResponse } from "next/server";
import { fetchCustomers } from "@/lib/supabase-data";
import { INITIAL_CUSTOMERS } from "@/lib/seed-data";

export async function GET() {
  try {
    const customers = await fetchCustomers();
    return NextResponse.json({ customers: customers.length ? customers : INITIAL_CUSTOMERS });
  } catch (error) {
    console.error("Error in GET /api/customers:", error);
    return NextResponse.json({ customers: INITIAL_CUSTOMERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Mock create for now
    return NextResponse.json({
      customer: {
        id: Date.now(),
        name: body.name,
        email: body.email,
        phone: body.phone || "+971 50 000 0000",
        emirate: body.emirate || "Dubai",
        address: body.address || "Jumeirah 1, Dubai",
        vipTier: body.vipTier || "Atelier Member",
        totalSpent: Number(body.totalSpent ?? 0),
        ordersCount: Number(body.ordersCount ?? 0),
        preferredSize: body.preferredSize || "M",
        notes: body.notes || "",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/customers:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}