import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { TeamClient } from "@/components/team-client";

export default async function TeamPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const isAdmin = currentProfile?.role === "admin" || currentProfile?.role === "leader";

  const { data: team } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, role, roles, instrument, instruments, can_sing, is_leader, is_active, phone, avatar_url"
    )
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  return <TeamClient members={team ?? []} isAdmin={isAdmin} />;
}
