import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const body = await req.json();
  const { full_name, phone, roles, instruments, can_sing } = body;

  if (!full_name) {
    return NextResponse.json({ error: "full_name is required" }, { status: 400 });
  }

  // Determine role based on ministries
  let role = "participant";
  if (roles?.includes("worship")) role = "musician";
  else if (roles?.includes("audiovisual")) role = "multimedia";

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone: phone ?? null,
      roles: roles ?? [],
      instruments: instruments ?? [],
      can_sing: can_sing ?? false,
      role,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
