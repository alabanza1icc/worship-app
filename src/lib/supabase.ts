import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client for general use (anon key)
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Service role client for trusted server operations (bypasses RLS)
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Convenience: service client for use in server components (auth already checked by Clerk middleware)
export function db() {
  return createServiceClient();
}