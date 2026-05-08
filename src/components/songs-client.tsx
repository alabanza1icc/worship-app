"use client";

import { useState } from "react";
import Link from "next/link";
import { Music, Search, Plus, AudioLines, ChevronRight } from "lucide-react";
import { Button, Badge, Modal, Input, Select, Textarea } from "@/components/ui";

interface SongItem {
  id: string;
  title: string;
  artist: string | null;
  original_key: string | null;
  tempo: number | null;
  has_audio: boolean;
  tags: string[];
}

interface CreateSongPayload {
  title: string;
  artist: string;
  original_key: string;
  tempo?: number;
  tags?: string[];
  notes?: string;
  spotify_url?: string;
  youtube_url?: string;
}

const KEYS = [
  "Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#",
  "Sol", "Sol#", "La", "La#", "Si",
];

const KEY_OPTIONS = KEYS.map((k) => ({ value: k, label: k }));

interface SongsClientProps {
  songs: SongItem[];
  isAdmin: boolean;
}

export function SongsClient({ songs: initialSongs, isAdmin }: SongsClientProps) {
  const [songs, setSongs] = useState<SongItem[]>(initialSongs);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [originalKey, setOriginalKey] = useState("Do");
  const [tempo, setTempo] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [formError, setFormError] = useState("");

  const filtered = songs.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || (s.artist?.toLowerCase().includes(q) ?? false);
  });

  const resetForm = () => {
    setTitle(""); setArtist(""); setOriginalKey("Do"); setTempo("");
    setTags(""); setNotes(""); setSpotifyUrl(""); setYoutubeUrl(""); setFormError("");
  };

  const handleClose = () => { setShowCreateModal(false); resetForm(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setFormError("Título y artista son requeridos.");
      return;
    }
    setLoading(true);
    setFormError("");

    const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const payload: CreateSongPayload = { title: title.trim(), artist: artist.trim(), original_key: originalKey };
    if (tempo.trim()) payload.tempo = parseInt(tempo, 10);
    if (parsedTags.length > 0) payload.tags = parsedTags;
    if (notes.trim()) payload.notes = notes.trim();
    if (spotifyUrl.trim()) payload.spotify_url = spotifyUrl.trim();
    if (youtubeUrl.trim()) payload.youtube_url = youtubeUrl.trim();

    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error al crear canción" }));
        setFormError(err.error ?? "Error al crear canción");
        return;
      }
      const created = (await res.json()) as SongItem;
      setSongs((prev) =>
        [...prev, { ...created, tags: created.tags ?? parsedTags }].sort((a, b) =>
          a.title.localeCompare(b.title)
        )
      );
      handleClose();
    } catch {
      setFormError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface font-headline">Canciones</h1>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="rounded-2xl">
            <Plus className="h-5 w-5 mr-1" />
            Nueva
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
        <input
          type="search"
          placeholder="Buscar por título o artista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[24px] border border-outline-variant/30 bg-white py-4 pl-12 pr-6 text-sm text-on-surface shadow-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 font-medium"
        />
      </div>

      {/* Songs List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-[32px] border border-outline-variant/20 bg-white p-12 text-center shadow-card">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-container text-on-surface-variant/40">
              <Music className="h-10 w-10" />
            </div>
            <p className="text-lg font-bold text-on-surface font-headline mb-2">
              {search.trim() ? "No se encontraron canciones" : "No hay canciones"}
            </p>
            <p className="text-sm font-medium text-on-surface-variant mb-8">
              {search.trim() ? "Intenta con otros términos de búsqueda." : "Comienza agregando tu repertorio."}
            </p>
            {isAdmin && !search.trim() && (
              <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
                Agregar primera canción
              </Button>
            )}
          </div>
        ) : (
          filtered.map((song) => (
            <Link key={song.id} href={`/songs/${song.id}`} className="group">
              <div className="rounded-[28px] border border-outline-variant/20 bg-white p-5 transition-all duration-300 shadow-card hover:shadow-card-md hover:border-primary/30">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors truncate font-headline">
                        {song.title}
                      </h3>
                      {song.has_audio && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary px-2 py-0.5 rounded-md bg-primary-container/40">
                          <AudioLines className="h-3 w-3" />
                          AUDIO
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                      <span className="text-sm font-semibold text-on-surface-variant">
                        {song.artist ?? "Artista desconocido"}
                      </span>
                      {song.original_key && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider">Tono:</span>
                          <span className="text-xs font-bold text-primary">{song.original_key}</span>
                        </div>
                      )}
                      {song.tempo && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider">BPM:</span>
                          <span className="text-xs font-bold text-on-surface">{song.tempo}</span>
                        </div>
                      )}
                    </div>
                    {song.tags && song.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {song.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-surface-container px-2.5 py-1 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-primary transition-all duration-300">
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Song Modal */}
      <Modal open={showCreateModal} onClose={handleClose} title="Nueva Canción">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Título *" type="text" placeholder="Ej: Maravilloso Dios" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Artista *" type="text" placeholder="Ej: Marcos Witt" value={artist} onChange={(e) => setArtist(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tonalidad *" options={KEY_OPTIONS} value={originalKey} onChange={(e) => setOriginalKey(e.target.value)} />
            <Input label="Tempo" type="number" placeholder="BPM" value={tempo} onChange={(e) => setTempo(e.target.value)} min={40} max={300} />
          </div>
          <Input label="Etiquetas" type="text" placeholder="adoración, congregacional (coma)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <Textarea label="Notas del director" placeholder="Instrucciones para el equipo..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Input label="URL de Spotify" type="url" placeholder="https://open.spotify.com/track/..." value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} />
          <Input label="URL de YouTube" type="url" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
          {formError && <p className="text-xs font-bold text-destructive ml-1">{formError}</p>}
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={handleClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Guardando..." : "Crear canción"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
