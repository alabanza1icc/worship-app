import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: songId } = await params;
    const supabase = createServiceClient();

    const { data: audioFiles, error } = await supabase
      .from("audio_tracks")
      .select("*")
      .eq("song_id", songId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(audioFiles);
  } catch (error) {
    console.error("Error fetching audio tracks:", error);
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

    const { id: songId } = await params;
    const supabase = createServiceClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { file_name, file_url, file_type, instrument, stem_type, file_size, duration } = body;

    if (!file_name || !file_url || !file_type) {
      return NextResponse.json(
        { error: "file_name, file_url, and file_type are required" },
        { status: 400 }
      );
    }

    const { data: audioTrack, error } = await supabase
      .from("audio_tracks")
      .insert({
        song_id: songId,
        file_name,
        file_url,
        file_type,
        instrument: instrument || null,
        stem_type: stem_type || null,
        file_size: file_size || null,
        duration: duration || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(audioTrack, { status: 201 });
  } catch (error) {
    console.error("Error creating audio track:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
