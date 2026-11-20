import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient(): ReturnType<typeof createClient> | null {
  if (!_client) {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    if (supabaseUrl.includes("placeholder")) return null;
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

export function isSupabaseConfigured(): boolean {
  const client = getSupabaseClient();
  return client !== null;
}