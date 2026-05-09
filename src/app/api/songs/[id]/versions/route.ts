import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";

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
    const { name, copyFromVersionId } = body;

    const { data: version, error: versionError } = await supabase
      .from("song_versions")
      .insert({
        song_id: songId,
        name,
        is_default: false,
      })
      .select()
      .single();

    if (versionError) {
      return NextResponse.json({ error: versionError.message }, { status: 500 });
    }

    if (copyFromVersionId) {
      const { data: sourceParts } = await supabase
        .from("song_parts")
        .select("*")
        .eq("version_id", copyFromVersionId)
        .order("order_index");

      if (sourceParts && sourceParts.length > 0) {
        const versionParts = sourceParts.map((part: { name: string; content: string; order_index: number }) => ({
          song_id: songId,
          version_id: version.id,
          name: part.name,
          content: part.content,
          order_index: part.order_index,
        }));

        await supabase.from("song_parts").insert(versionParts);
      }
    }

    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    console.error("Error creating song version:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    const { data: versions, error } = await supabase
      .from("song_versions")
      .select("*")
      .eq("song_id", songId)
      .order("created_at");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(versions || []);
  } catch (error) {
    console.error("Error fetching song versions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}