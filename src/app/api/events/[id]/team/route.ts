import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { requireEventManager } from "@/lib/permissions";
import { createNotification } from "@/lib/notifications";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const supabase = createServiceClient();

    const { data: team, error } = await supabase
      .from("event_team")
      .select(`
        *,
        profiles(id, full_name, avatar_url, instrument)
      `)
      .eq("event_id", eventId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error fetching event team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const supabase = createServiceClient();

    const profile = await requireEventManager(userId);
    if (!profile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { profile_id, role_type, status = "pending", notes } = body;

    const { data: member, error } = await supabase
      .from("event_team")
      .insert({
        event_id: eventId,
        profile_id,
        role_type,
        status,
        notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notify the assigned member
    const { data: eventData } = await supabase
      .from("events")
      .select("title")
      .eq("id", eventId)
      .single();

    if (eventData && profile_id !== userId) {
      await createNotification(supabase, {
        profile_id,
        type: "team_change",
        title: "Fuiste asignado a un evento",
        message: `Tienes un nuevo rol en el equipo: ${eventData.title}`,
        data: { event_id: eventId, role_type },
      });
    }

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const supabase = createServiceClient();

    const profile = await requireEventManager(userId);
    if (!profile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const eventTeamId = searchParams.get("eventTeamId") || searchParams.get("memberId");

    if (!eventTeamId) {
      return NextResponse.json({ error: "Missing eventTeamId" }, { status: 400 });
    }

    const { error } = await supabase
      .from("event_team")
      .delete()
      .eq("id", eventTeamId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const supabase = createServiceClient();
    const body = await req.json();
    const { eventTeamId, status, notes, role_type } = body;

    if (!eventTeamId) {
      return NextResponse.json({ error: "Missing eventTeamId" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("event_team")
      .select("profile_id")
      .eq("id", eventTeamId)
      .eq("event_id", eventId)
      .single();

    const manager = await requireEventManager(userId);
    const isSelfAttendance = existing?.profile_id === userId && role_type === undefined;

    if (!manager && !isSelfAttendance) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (role_type !== undefined && manager) updateData.role_type = role_type;

    const { data: member, error } = await supabase
      .from("event_team")
      .update(updateData)
      .eq("id", eventTeamId)
      .eq("event_id", eventId)
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
