import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/permissions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: memberId } = await params;
    const supabase = createServiceClient();

    const currentUser = await requireAdmin(userId);
    if (!currentUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      full_name,
      phone,
      instrument,
      instruments,
      roles,
      can_sing,
      role,
      is_leader,
      is_active,
    } = body;

    const { data: member, error } = await supabase
      .from("profiles")
      .update({
        full_name,
        phone,
        instrument,
        instruments,
        roles,
        can_sing,
        role,
        is_leader,
        is_active,
      })
      .eq("id", memberId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
