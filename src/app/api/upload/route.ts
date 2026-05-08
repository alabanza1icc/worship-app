import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ["audio/mpeg", "audio/wav", "audio/mp3", "application/pdf"];

async function generateR2UploadUrl(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<{ uploadUrl: string; fileUrl: string } | null> {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    return null;
  }

  const date = new Date().toISOString().split("T")[0];
  const path = `songs/${date}/${crypto.randomUUID()}-${fileName}`;

  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const url = `https://${host}/${path}`;

  return {
    uploadUrl: url,
    fileUrl: `https://${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${path}`,
  };
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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const songId = formData.get("songId") as string;
    const description = formData.get("description") as string;

    if (!file || !songId) {
      return NextResponse.json({ error: "Missing file or songId" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 });
    }

    const contentType = file.type || "application/octet-stream";
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: MP3, WAV, PDF" },
        { status: 400 }
      );
    }

    const fileType = contentType.startsWith("audio/") ? "audio" : "pdf";

    const result = await generateR2UploadUrl(file.name, contentType, file.size);

    if (!result) {
      return NextResponse.json({ error: "R2 not configured" }, { status: 500 });
    }

    const fileBuffer = await file.arrayBuffer();
    const response = await fetch(result.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": file.size.toString(),
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      console.error("R2 upload failed:", response.status);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: fileRecord, error: dbError } = await supabase
      .from("files")
      .insert({
        song_id: songId,
        file_name: file.name,
        file_type: fileType,
        file_url: result.fileUrl,
        file_size: file.size,
        description: description || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    if (fileType === "audio") {
      await supabase
        .from("songs")
        .update({ has_audio: true })
        .eq("id", songId);
    }

    return NextResponse.json(fileRecord, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
    }

    const { error } = await supabase.from("files").delete().eq("id", fileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}