import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { EventDetailClient } from "@/components/event-detail-client";
import { canManageEvents } from "@/lib/permissions";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const supabase = createServiceClient();

  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  // Fetch profile for role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_leader")
    .eq("id", userId)
    .single();

  const isAdmin = profile?.role === "admin";
  const isLeader = canManageEvents(profile);

  // Fetch setlist with song details and parts
  const { data: eventSongs } = await supabase
    .from("event_songs")
    .select(`
      *,
      song:songs(*, song_parts(*))
    `)
    .eq("event_id", id)
    .order("order_index", { ascending: true });

  // Fetch event team with profiles
  const { data: eventTeam } = await supabase
    .from("event_team")
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq("event_id", id);

  // Fetch sermon
  const { data: sermon } = await supabase
    .from("sermons")
    .select("*")
    .eq("event_id", id)
    .single();

  // Fetch bosquejo
  const { data: bosquejo } = await supabase
    .from("event_bosquejo")
    .select("*")
    .eq("event_id", id)
    .single();

  // Fetch all songs (for add to setlist modal)
  const { data: allSongs } = await supabase
    .from("songs")
    .select("id, title, artist, original_key")
    .eq("status", "active")
    .order("title");

  // Fetch all profiles (for team assignment panel)
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, roles, instrument, instruments, can_sing, is_leader")
    .eq("is_active", true)
    .order("full_name");

  // Fetch current user's attendance record
  const { data: myAttendance } = await supabase
    .from("event_attendance")
    .select("*")
    .eq("event_id", id)
    .eq("profile_id", userId)
    .single();

  return (
    <EventDetailClient
      event={event}
      eventSongs={eventSongs || []}
      eventTeam={eventTeam || []}
      sermon={sermon || null}
      bosquejo={bosquejo || null}
      isAdmin={isAdmin}
      isLeader={isLeader}
      allSongs={allSongs || []}
      allProfiles={allProfiles || []}
      currentUserId={userId}
      myAttendance={myAttendance || null}
    />
  );
}
