import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { requireEventManager } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: events, error } = await supabase
      .from("events")
      .select(`
        *,
        event_songs(count)
      `)
      .order("event_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const profile = await requireEventManager(userId);
    if (!profile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      event_type,
      event_date,
      start_time,
      end_time,
      location,
      description,
      is_published,
    } = body;

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        title,
        event_type,
        event_date,
        start_time,
        end_time,
        location,
        description,
        is_published: is_published || false,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
