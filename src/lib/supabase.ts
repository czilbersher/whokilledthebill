import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-safe singleton
export const supabase = createClient<Database>(url, key);

// Server-side client (same credentials, called per-request to avoid shared state)
export function createServerSupabaseClient() {
  return createClient<Database>(url, key);
}
