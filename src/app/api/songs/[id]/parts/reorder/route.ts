import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

  const { id: songId } = await params;
  const body = await req.json();
  const { partId, newIndex, versionId } = body;

  const versionFilter = versionId ?? "null";

  const { data: parts, error: fetchError } = await supabase
    .from("song_parts")
    .select("id, order_index, version_id")
    .eq("song_id", songId)
    .order("order_index");

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const targetParts = versionId
    ? parts.filter((p: { version_id: string | null }) => p.version_id === versionId)
    : parts.filter((p: { version_id: string | null }) => !p.version_id);

  const otherParts = parts.filter((p: { version_id: string | null }) =>
    versionId ? p.version_id !== versionId : p.version_id !== null
  );

  const oldIndex = targetParts.findIndex((p: { id: string }) => p.id === partId);
  if (oldIndex === -1) {
    return NextResponse.json({ error: "Part not found" }, { status: 404 });
  }

  const reordered = [...targetParts];
  const [moved] = reordered.splice(oldIndex, 1);
  reordered.splice(newIndex, 0, moved);

  const updates = reordered.map((p: { id: string; order_index: number }, idx: number) =>
    supabase.from("song_parts").update({ order_index: idx }).eq("id", p.id)
  );

  await Promise.all(updates);

  return NextResponse.json({ success: true });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

  const { id: songId } = await params;
  const body = await req.json();
  const { sourceVersionId, targetVersionId, partOrder } = body;

  if (sourceVersionId && targetVersionId && partOrder) {
    const updates = partOrder.map((partId: string, idx: number) =>
      supabase.from("song_parts").update({ order_index: idx, version_id: targetVersionId }).eq("id", partId)
    );
    await Promise.all(updates);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}