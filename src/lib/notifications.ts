import type { SupabaseClient } from "@supabase/supabase-js";

type NotifType = "event_invite" | "song_update" | "team_change" | "schedule_change" | "bosquejo";

export async function createNotification(
  supabase: SupabaseClient,
  {
    profile_id,
    type,
    title,
    message,
    data,
  }: {
    profile_id: string;
    type: NotifType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
) {
  await supabase.from("notifications").insert({
    profile_id,
    type,
    title,
    message,
    data: data ?? null,
  });
}

export async function notifyTeamMembers(
  supabase: SupabaseClient,
  eventId: string,
  type: NotifType,
  title: string,
  message: string,
  excludeUserId?: string
) {
  const { data: team } = await supabase
    .from("event_team")
    .select("profile_id")
    .eq("event_id", eventId);

  if (!team || team.length === 0) return;

  const inserts = team
    .filter((m) => m.profile_id !== excludeUserId)
    .map((m) => ({ profile_id: m.profile_id, type, title, message, data: null }));

  if (inserts.length > 0) {
    await supabase.from("notifications").insert(inserts);
  }
}
