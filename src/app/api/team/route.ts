import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: members, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_active", true)
      .order("full_name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}