import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { requireEventManager } from "@/lib/permissions";
import { notifyTeamMembers } from "@/lib/notifications";

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

    const { data: eventSongs, error } = await supabase
      .from("event_songs")
      .select(`
        *,
        songs(
          *,
          song_parts(*)
        )
      `)
      .eq("event_id", eventId)
      .order("order_index");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(eventSongs);
  } catch (error) {
    console.error("Error fetching event songs:", error);
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
    const { song_id, custom_key, director_notes } = body;

    const { data: maxOrder } = await supabase
      .from("event_songs")
      .select("order_index")
      .eq("event_id", eventId)
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = maxOrder ? maxOrder.order_index + 1 : 0;

    const { data: eventSong, error } = await supabase
      .from("event_songs")
      .insert({
        event_id: eventId,
        song_id,
        order_index: nextOrder,
        custom_key,
        director_notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notify team members about the new song
    const { data: songData } = await supabase
      .from("songs")
      .select("title")
      .eq("id", song_id)
      .single();
    const { data: eventData } = await supabase
      .from("events")
      .select("title")
      .eq("id", eventId)
      .single();

    if (songData && eventData) {
      await notifyTeamMembers(
        supabase,
        eventId,
        "song_update",
        "Nueva canción en el setlist",
        `"${songData.title}" fue añadida al setlist de ${eventData.title}`,
        userId
      );
    }

    return NextResponse.json(eventSong, { status: 201 });
  } catch (error) {
    console.error("Error adding song to event:", error);
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
    const eventSongId = searchParams.get("eventSongId");

    if (!eventSongId) {
      return NextResponse.json({ error: "Missing eventSongId" }, { status: 400 });
    }

    const { error } = await supabase
      .from("event_songs")
      .delete()
      .eq("id", eventSongId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing song from event:", error);
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

    const profile = await requireEventManager(userId);
    if (!profile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { eventSongId, custom_key, director_notes, order_index } = body;

    const updateData: Record<string, unknown> = {};
    if (custom_key !== undefined) updateData.custom_key = custom_key;
    if (director_notes !== undefined) updateData.director_notes = director_notes;
    if (order_index !== undefined) updateData.order_index = order_index;

    const { data: eventSong, error } = await supabase
      .from("event_songs")
      .update(updateData)
      .eq("id", eventSongId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(eventSong);
  } catch (error) {
    console.error("Error updating event song:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
