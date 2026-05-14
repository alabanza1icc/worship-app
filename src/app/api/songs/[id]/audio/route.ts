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
      .select("role, is_leader")
      .eq("id", userId)
      .single();

    const canUpload = profile?.role === "admin" || profile?.role === "leader" || profile?.is_leader;
    if (!canUpload) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") ?? "";

    // Handle FormData file upload (stores in Supabase storage)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const fileType = (formData.get("file_type") as string) || "multitrack";

      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

      const fileExt = file.name.split(".").pop() ?? "mp3";
      const storagePath = `${songId}/${crypto.randomUUID()}.${fileExt}`;

      const fileBuffer = await file.arrayBuffer();
      const { error: storageError } = await supabase.storage
        .from("audio")
        .upload(storagePath, fileBuffer, { contentType: file.type || "audio/mpeg", upsert: false });

      if (storageError) {
        return NextResponse.json({ error: storageError.message }, { status: 500 });
      }

      const { data: urlData } = supabase.storage.from("audio").getPublicUrl(storagePath);

      const { data: track, error: dbError } = await supabase
        .from("audio_tracks")
        .insert({
          song_id: songId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: fileType,
          file_size: file.size,
        })
        .select()
        .single();

      if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

      await supabase.from("songs").update({ has_audio: true }).eq("id", songId);

      return NextResponse.json(track, { status: 201 });
    }

    // Handle JSON body (manual URL registration)
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
