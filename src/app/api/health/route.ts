import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const envChecks = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    CLERK_SECRET_KEY: Boolean(process.env.CLERK_SECRET_KEY),
    CLERK_WEBHOOK_SECRET: Boolean(process.env.CLERK_WEBHOOK_SECRET),
  };

  const missing = Object.entries(envChecks)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  // Test auth
  let authResult: Record<string, unknown> = {};
  try {
    const { userId } = await auth();
    authResult = { ok: true, userId: userId ? "present" : null };
  } catch (e) {
    authResult = { ok: false, error: String(e) };
  }

  // Test Supabase
  let supabaseResult: Record<string, unknown> = {};
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);
    supabaseResult = {
      ok: !error,
      rowCount: data?.length ?? 0,
      error: error ? error.message : null,
    };
  } catch (e) {
    supabaseResult = { ok: false, error: String(e) };
  }

  // Test profiles columns
  let schemaResult: Record<string, unknown> = {};
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, onboarding_completed, is_leader")
      .limit(1);
    schemaResult = {
      ok: !error,
      error: error ? error.message : null,
    };
  } catch (e) {
    schemaResult = { ok: false, error: String(e) };
  }

  return NextResponse.json({
    status: missing.length === 0 ? "ok" : "misconfigured",
    env: envChecks,
    missing,
    auth: authResult,
    supabase: supabaseResult,
    schema: schemaResult,
  });
}
