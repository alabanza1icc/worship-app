import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { requireEventManager } from "@/lib/permissions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const profile = await requireEventManager(userId);
    if (!profile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { eventId } = body;

    const { data: event } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { data: members } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("is_active", true);

    if (!members || members.length === 0) {
      return NextResponse.json({ error: "No members to notify" }, { status: 400 });
    }

    const eventDate = new Date(event.event_date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emails = members.map((m) => ({
      from: "WorshipApp <noreply@worshipapp.com>",
      to: m.email,
      subject: `Nuevo evento: ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .content { background: #0a0a0a; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .event-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
            .event-info { color: #a1a1aa; margin: 5px 0; }
            .cta { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">WorshipApp</div>
            </div>
            <div class="content">
              <div class="event-title">${event.title}</div>
              <div class="event-info">📅 ${eventDate}</div>
              ${event.start_time ? `<div class="event-info">🕐 ${event.start_time}</div>` : ""}
              ${event.location ? `<div class="event-info">📍 ${event.location}</div>` : ""}
              ${event.description ? `<p style="margin-top: 15px;">${event.description}</p>` : ""}
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}" class="cta">Ver evento</a>
            </div>
          </div>
        </body>
        </html>
      `,
    }));

    await resend.batch.send(emails);

    return NextResponse.json({ success: true, sent: emails.length });
  } catch (error) {
    console.error("Error sending event notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
