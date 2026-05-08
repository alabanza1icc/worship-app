import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase";
import { WelcomeEmail } from "@/emails/welcome";

const svixWebhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";
const resend = new Resend(process.env.RESEND_API_KEY);

interface WebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const headers = req.headers;

    const svixId = headers.get("svix-id");
    const svixTimestamp = headers.get("svix-timestamp");
    const svixSignature = headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    const wh = new Webhook(svixWebhookSecret);
    let event: WebhookEvent;

    try {
      const rawEvent = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
      event = rawEvent as WebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { type, data } = event;
    const supabase = createServiceClient();

    if (type === "user.created" || type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = data;
      const email = email_addresses?.[0]?.email_address || "";
      const fullName = [first_name, last_name].filter(Boolean).join(" ") || email;
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
      const isConfiguredAdmin = adminEmail && email.toLowerCase() === adminEmail;

      const { error } = await supabase.from("profiles").upsert({
        id,
        email,
        full_name: fullName,
        avatar_url: image_url || null,
        role: isConfiguredAdmin ? "admin" : "participant",
        roles: [],
        instruments: [],
        can_sing: false,
        is_leader: Boolean(isConfiguredAdmin),
        is_active: true,
      }, { onConflict: "id" });

      if (error) {
        console.error("Error upserting profile:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (type === "user.created" && process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "WorshipApp <onboarding@resend.dev>",
          to: email,
          subject: "Bienvenido a WorshipApp",
          react: WelcomeEmail({
            userName: fullName,
            appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          }),
        });
      }
    }

    if (type === "user.deleted") {
      const { id } = data;
      const { error } = await supabase.from("profiles").update({ is_active: false }).eq("id", id);

      if (error) {
        console.error("Error deactivating profile:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
