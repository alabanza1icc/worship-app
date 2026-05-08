import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServiceClient } from "@/lib/supabase";

const svixWebhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const headers = req.headers;

    const svixId = headers.get("svix-id");
    const svixTimestamp = headers.get("svix-timestamp");
    const svixSignature = headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing svix headers");
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    if (!svixWebhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const wh = new Webhook(svixWebhookSecret);
    let event;

    try {
      event = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { type, data } = event as { type: string; data: Record<string, unknown> };
    const supabase = createServiceClient();

    console.log(`Processing webhook event: ${type}`);

    if (type === "user.created" || type === "user.updated") {
      const attributes = (data.attributes as Record<string, unknown>) || data;
      const id = (attributes.id as string) || (data.id as string);
      const emailAddresses = attributes.email_addresses as { email_address: string }[] | undefined;
      const email = emailAddresses?.[0]?.email_address || "";
      const firstName = attributes.first_name as string | undefined;
      const lastName = attributes.last_name as string | undefined;
      const imageUrl = attributes.image_url as string | undefined;
      const fullName = [firstName, lastName].filter(Boolean).join(" ") || email;

      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
      const isAdmin = adminEmail && email.toLowerCase() === adminEmail;

      console.log(`Upserting profile for: ${email}, id: ${id}`);

      const { error } = await supabase.from("profiles").upsert({
        id,
        email,
        full_name: fullName,
        avatar_url: imageUrl || null,
        role: isAdmin ? "admin" : "participant",
        is_active: true,
      }, { onConflict: "id" });

      if (error) {
        console.error("Error upserting profile:", error);
        return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
      }

      console.log(`Profile upserted for ${email} with role ${isAdmin ? "admin" : "participant"}`);
    }

    if (type === "user.deleted") {
      const attributes = (data.attributes as Record<string, unknown>) || data;
      const id = (attributes.id as string) || (data.id as string);
      const { error } = await supabase.from("profiles").update({ is_active: false }).eq("id", id);

      if (error) {
        console.error("Error deactivating profile:", error);
        return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}