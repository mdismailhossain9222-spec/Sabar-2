import { NextResponse } from "next/server";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: false, reason: "Supabase not configured" });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ ok: false, reason: "Supabase client unavailable" }, { status: 500 });
    }

    const { data, error } = await client.from("orders").select("id").limit(1);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}