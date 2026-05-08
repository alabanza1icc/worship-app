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

    const { data: charts, error } = await supabase
      .from("song_chart_pro")
      .select("*")
      .eq("song_id", songId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(charts);
  } catch (error) {
    console.error("Error fetching ChartPro charts:", error);
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
    const { part_id, version_id, content, original_key, tempo } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    if (!part_id && !version_id) {
      return NextResponse.json(
        { error: "Either part_id or version_id must be provided" },
        { status: 400 }
      );
    }

    if (part_id && version_id) {
      return NextResponse.json(
        { error: "Cannot specify both part_id and version_id" },
        { status: 400 }
      );
    }

    const { data: chart, error } = await supabase
      .from("song_chart_pro")
      .insert({
        song_id: songId,
        part_id: part_id || null,
        version_id: version_id || null,
        content,
        original_key: original_key || null,
        tempo: tempo || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(chart, { status: 201 });
  } catch (error) {
    console.error("Error creating ChartPro chart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
