import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");
    const key = searchParams.get("key");
    const tags = searchParams.getAll("tags");

    let query = supabase
      .from("songs")
      .select(`
        *,
        song_parts(*),
        files(*)
      `)
      .eq("status", "active")
      .order("title");

    if (search) {
      query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%`);
    }

    if (key) {
      query = query.eq("original_key", key);
    }

    if (tags.length > 0) {
      query = query.overlaps("tags", tags);
    }

    const { data: songs, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      artist,
      original_key,
      tempo,
      tags,
      notes,
      spotify_url,
      youtube_url,
      parts,
    } = body;

    const { data: song, error: songError } = await supabase
      .from("songs")
      .insert({
        title,
        artist,
        original_key,
        tempo,
        tags,
        notes,
        spotify_url,
        youtube_url,
        status: "active",
        has_audio: false,
      })
      .select()
      .single();

    if (songError) {
      return NextResponse.json({ error: songError.message }, { status: 500 });
    }

    if (parts && parts.length > 0) {
      const partsToInsert = parts.map((part: { name: string; content: string }, index: number) => ({
        song_id: song.id,
        name: part.name,
        content: part.content,
        order_index: index,
      }));

      const { error: partsError } = await supabase.from("song_parts").insert(partsToInsert);

      if (partsError) {
        console.error("Error inserting song parts:", partsError);
      }
    }

    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error("Error creating song:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}