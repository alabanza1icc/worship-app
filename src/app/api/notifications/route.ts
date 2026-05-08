import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data: notifications, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
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
  const { profile_id, type, title, message, data: notificationData } = body;

  if (!profile_id || !type || !title || !message) {
    return NextResponse.json(
      { error: "profile_id, type, title, and message are required" },
      { status: 400 }
    );
  }

  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      profile_id,
      type,
      title,
      message,
      data: notificationData ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(notification, { status: 201 });
}

// Mark notifications as read
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const body = await req.json();
  const { ids, markAllRead } = body as { ids?: string[]; markAllRead?: boolean };

  if (markAllRead) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("profile_id", userId)
      .eq("is_read", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: "ids or markAllRead required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", ids)
    .eq("profile_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
