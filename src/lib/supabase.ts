import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only warn, don't throw at top level to prevent crashing the whole app
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn("Supabase environment variables are missing. Some features may not work.");
  }
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
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
