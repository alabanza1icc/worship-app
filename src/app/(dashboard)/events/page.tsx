import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { EventsClient } from "@/components/events-client";
import { canManageEvents } from "@/lib/permissions";

interface EventRow {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  start_time: string | null;
  location: string | null;
  is_live: boolean;
  is_published: boolean;
  event_songs: { count: number }[];
}

export default async function EventsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_leader")
    .eq("id", userId)
    .single();

  const canManage = canManageEvents(profile);

  const { data: events } = await supabase
    .from("events")
    .select(
      "id, title, event_type, event_date, start_time, location, is_live, is_published, event_songs(count)"
    )
    .order("event_date", { ascending: true });

  const mapped = (events || []).map((e: EventRow) => ({
    id: e.id,
    title: e.title,
    event_type: e.event_type,
    event_date: e.event_date,
    start_time: e.start_time,
    location: e.location,
    is_live: e.is_live,
    is_published: e.is_published,
    song_count: e.event_songs?.[0]?.count ?? 0,
  }));

  return <EventsClient events={mapped} isAdmin={canManage} />;
}
