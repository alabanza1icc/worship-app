import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  const url = new URL(_req.url);
  const versionId = url.searchParams.get("versionId");

  let query = supabase
    .from("song_parts")
    .select("*")
    .eq("song_id", id)
    .order("order_index");

  if (versionId === "null" || versionId === null) {
    query = query.is("version_id", null);
  } else if (versionId) {
    query = query.eq("version_id", versionId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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
  const { name, content, order_index, version_id } = body;

  const { data, error } = await supabase
    .from("song_parts")
    .insert({ song_id: id, name, content, order_index: order_index ?? 0, version_id: version_id ?? null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const { partId, name, content, newIndex, versionId } = body;

  if (newIndex !== undefined) {
    const { data: parts, error: fetchError } = await supabase
      .from("song_parts")
      .select("id, order_index, version_id")
      .eq("song_id", songId)
      .order("order_index");

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    type PartWithVersion = { id: string; order_index: number; version_id: string | null };

    const targetParts = parts.filter((p: PartWithVersion) =>
      versionId ? p.version_id === versionId : p.version_id === null
    );

    const oldIndex = targetParts.findIndex((p: PartWithVersion) => p.id === partId);
    if (oldIndex === -1) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    const reordered = [...targetParts];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updates = reordered.map((p: PartWithVersion, idx: number) =>
      supabase.from("song_parts").update({ order_index: idx }).eq("id", p.id)
    );

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  }

  const { data, error } = await supabase
    .from("song_parts")
    .update({ name, content })
    .eq("id", partId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  _params: { params: Promise<{ id: string }> }
) {
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

  const { searchParams } = new URL(req.url);
  const partId = searchParams.get("partId");

  if (!partId) {
    return NextResponse.json({ error: "partId required" }, { status: 400 });
  }

  const { error } = await supabase.from("song_parts").delete().eq("id", partId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
