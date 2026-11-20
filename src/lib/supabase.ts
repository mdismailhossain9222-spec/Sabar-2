/**
 * Supabase client — initialized from Vite env vars.
 * URL + anon key must be set at build/runtime via Cloudflare Workers environment
 * variables or .env.local (development). See .env.example for placeholders.
 */
import { createClient } from '@supabase/supabase-js';

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_ANON_KEY?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/** Returns true when both credentials are configured. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.startsWith('http://placeholder'));
}

/** Lazy singleton — constructed only when first used. */
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!_client) {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
      );
    }
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}
