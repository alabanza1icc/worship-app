import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { SongsClient } from "@/components/songs-client";

interface SongRow {
  id: string;
  title: string;
  artist: string | null;
  original_key: string | null;
  tempo: number | null;
  has_audio: boolean;
  tags: string[] | null;
}

export default async function SongsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: songs } = await supabase
    .from("songs")
    .select("id, title, artist, original_key, tempo, has_audio, tags")
    .eq("status", "active")
    .order("title");

  const mapped = (songs || []).map((s: SongRow) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    original_key: s.original_key,
    tempo: s.tempo,
    has_audio: s.has_audio,
    tags: s.tags ?? [],
  }));

  return <SongsClient songs={mapped} isAdmin={isAdmin} />;
}
