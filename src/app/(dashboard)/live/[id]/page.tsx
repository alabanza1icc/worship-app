import { createServiceClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import LiveModeClient from "@/components/live-mode-client";

interface SetlistSong {
  id: string;
  title: string;
  artist: string;
  custom_key: string | null;
  original_key: string | null;
  parts: { name: string; content: string }[];
}

export default async function LivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id: eventId } = await params;
  const supabase = createServiceClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, event_type, is_live")
    .eq("id", eventId)
    .single();

  if (!event) notFound();

  const { data: eventSongs } = await supabase
    .from("event_songs")
    .select(`
      id,
      custom_key,
      order_index,
      song:songs (
        id,
        title,
        artist,
        original_key,
        song_parts (name, content, order_index)
      )
    `)
    .eq("event_id", eventId)
    .order("order_index", { ascending: true });

  const setlist: SetlistSong[] = (eventSongs || []).map((es) => {
    type SongJoin = {
      id: string;
      title: string;
      artist: string;
      original_key: string | null;
      song_parts: { name: string; content: string; order_index: number }[];
    };
    const song = (es.song as unknown) as SongJoin | null;

    return {
      id: es.id,
      title: song?.title ?? "Sin título",
      artist: song?.artist ?? "",
      custom_key: es.custom_key,
      original_key: song?.original_key ?? null,
      parts: (song?.song_parts ?? [])
        .sort((a, b) => a.order_index - b.order_index)
        .map((p) => ({ name: p.name, content: p.content })),
    };
  });

  return (
    <LiveModeClient
      eventId={event.id}
      eventTitle={event.title}
      initialSetlist={setlist}
    />
  );
}
