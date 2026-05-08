import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { WelcomeEmail } from "@/emails/welcome";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", userId)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://worshipapp.com";
    const signUpUrl = `${appUrl}/sign-up`;

    const html = await render(
      WelcomeEmail({
        userName: name || "nuevo miembro",
        appUrl: signUpUrl,
      })
    );

    await resend.emails.send({
      from: "WorshipApp <noreply@worshipapp.com>",
      to: email,
      subject: "Invitación a WorshipApp",
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
