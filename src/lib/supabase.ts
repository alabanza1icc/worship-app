import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Warn loudly if real env vars are missing — API calls will return errors
// but the app will not crash at module load or on every page.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error(
    "[WorshipApp] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. " +
    "Add these to your Vercel environment variables and redeploy."
  );
}

// Browser / server anon client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client for general use (anon key)
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Service role client for trusted server operations (bypasses RLS)
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.warn(
      "[WorshipApp] SUPABASE_SERVICE_ROLE_KEY is not set. " +
      "Falling back to anon key — RLS policies apply. " +
      "Set this variable in your Vercel project settings and redeploy."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey ?? supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Convenience alias
export function db() {
  return createServiceClient();
}
