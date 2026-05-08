import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { BosquejoNotificationEmail } from "@/emails/bosquejo-notification";

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/events/[id]/bosquejo — get bosquejo for event
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("event_bosquejo")
    .select("*")
    .eq("event_id", eventId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? null);
}

// POST /api/events/[id]/bosquejo — create or update bosquejo
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;
  const supabase = createServiceClient();

  // Only admin or leader can create bosquejo
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_leader, full_name")
    .eq("id", userId)
    .single();

  if (!profile || (profile.role !== "admin" && !profile.is_leader)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { q1_respuesta, q2_respuesta, notas_adicionales } = body;

  if (!q1_respuesta || !q2_respuesta) {
    return NextResponse.json(
      { error: "q1_respuesta and q2_respuesta are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("event_bosquejo")
    .upsert(
      {
        event_id: eventId,
        leader_id: userId,
        q1_respuesta,
        q2_respuesta,
        notas_adicionales: notas_adicionales ?? null,
      },
      { onConflict: "event_id,leader_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/events/[id]/bosquejo/send-email is handled separately below
// PATCH /api/events/[id]/bosquejo — send bosquejo email to all participants
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;
  const supabase = createServiceClient();

  // Only admin or leader
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_leader, full_name")
    .eq("id", userId)
    .single();

  if (!profile || (profile.role !== "admin" && !profile.is_leader)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get bosquejo
  const { data: bosquejo } = await supabase
    .from("event_bosquejo")
    .select("*")
    .eq("event_id", eventId)
    .single();

  if (!bosquejo) {
    return NextResponse.json({ error: "Bosquejo not found" }, { status: 404 });
  }

  // Get event details
  const { data: event } = await supabase
    .from("events")
    .select("title, event_date, start_time")
    .eq("id", eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Get all team members' emails
  const { data: teamMembers } = await supabase
    .from("event_team")
    .select("profile:profiles(email, full_name)")
    .eq("event_id", eventId);

  if (!teamMembers || teamMembers.length === 0) {
    return NextResponse.json({ error: "No team members found" }, { status: 400 });
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":");
    return `${h}:${m}`;
  };

  const appUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`;
  const leaderName = profile.full_name || "El líder";

  // Send email to each team member
  const emailPromises = teamMembers.map(async (member) => {
    type ProfileJoin = { email: string; full_name: string };
    const p = (member.profile as unknown) as ProfileJoin | null;
    if (!p?.email) return;

    const html = await render(
      BosquejoNotificationEmail({
        userName: p.full_name || "Participante",
        leaderName,
        eventTitle: event.title,
        eventDate: formatDate(event.event_date),
        q1Respuesta: bosquejo.q1_respuesta,
        q2Respuesta: bosquejo.q2_respuesta,
        notasAdicionales: bosquejo.notas_adicionales,
        appUrl,
      })
    );

    return resend.emails.send({
      from: "WorshipApp <noreply@worshipapp.com>",
      to: p.email,
      subject: `Bosquejo compartido: ${event.title}`,
      html,
    });
  });

  await Promise.allSettled(emailPromises);

  // Mark email as sent
  await supabase
    .from("event_bosquejo")
    .update({ email_enviado: true, email_enviado_at: new Date().toISOString() })
    .eq("id", bosquejo.id);

  return NextResponse.json({ success: true, emailsSent: teamMembers.length });
}
