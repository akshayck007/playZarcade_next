import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 'x-application-name': 'playz-arcade' },
  },
  db: {
    schema: 'public',
  },
});

// Helper to handle Supabase errors consistently
export async function handleSupabaseError<T>(promise: Promise<{ data: T | null; error: any }>) {
  const { data, error } = await promise;
  if (error) {
    console.error("[SUPABASE ERROR]", error);
    return { data: null, error };
  }
  return { data, error: null };
}
