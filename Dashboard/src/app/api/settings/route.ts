import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
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
      });
    }

    // For now, return mock settings since atelier_settings table isn't in shared schema
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error in GET /api/settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    // Mock update for now
    return NextResponse.json({ settings: body });
  } catch (error) {
    console.error("Error in PATCH /api/settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}