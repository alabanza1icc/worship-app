import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { SongDetailClient } from "@/components/song-detail-client";

export default async function SongDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: song } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id)
    .single();

  if (!song) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const isAdmin = profile?.role === "admin";

  const [{ data: parts }, { data: versions }, { data: audioTracks }] =
    await Promise.all([
      supabase
        .from("song_parts")
        .select("*")
        .eq("song_id", id)
        .order("order_index", { ascending: true }),
      supabase
        .from("song_versions")
        .select("*")
        .eq("song_id", id)
        .order("created_at"),
      supabase
        .from("audio_tracks")
        .select("*")
        .eq("song_id", id)
        .order("created_at"),
    ]);

  return (
    <SongDetailClient
      song={song}
      parts={parts || []}
      versions={versions || []}
      audioTracks={audioTracks || []}
      isAdmin={isAdmin}
    />
  );
}
