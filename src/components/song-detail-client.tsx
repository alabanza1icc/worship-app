"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronLeft,
  Edit,
  Trash2,
  Plus,
  Music2,
  AudioLines,
  ExternalLink,
  RotateCcw,
  Minus,
  GripVertical,
  Copy,
} from "lucide-react";
import { Button, Badge, Input, Textarea, Select, Modal } from "@/components/ui";
import { AudioPlayer } from "@/components/audio-player";
import { SongPartsDisplay, abbreviateSection } from "./chord-sheet";
import { SongStructure } from "./song-structure";
import { transposeKey } from "@/lib/chart-pro";
import { cn } from "@/lib/utils";

interface Song {
  id: string;
  title: string;
  artist: string;
  original_key: string;
  tempo: number | null;
  tags: string[] | null;
  notes: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  has_audio: boolean;
  status: "active" | "archived";
}

interface SongPart {
  id: string;
  song_id: string;
  name: string;
  content: string;
  order_index: number;
  version_id: string | null;
}

interface SongVersion {
  id: string;
  song_id: string;
  name: string;
  is_default: boolean;
}

interface AudioTrack {
  id: string;
  song_id: string;
  file_name: string;
  file_url: string;
  file_type: "multitrack" | "stem" | "reference" | "backing_track";
  instrument: string | null;
  duration: number | null;
}

interface Props {
  song: Song;
  parts: SongPart[];
  versions: SongVersion[];
  audioTracks: AudioTrack[];
  isAdmin: boolean;
}

const SPANISH_KEYS = [
  "Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#",
  "Sol", "Sol#", "La", "La#", "Si",
];

const FILE_TYPE_LABELS: Record<AudioTrack["file_type"], string> = {
  multitrack: "Multitrack",
  stem: "Stem",
  reference: "Referencia",
  backing_track: "Pista base",
};

function SortablePart({
  part,
  isAdmin,
  onEdit,
  onDelete,
}: {
  part: SongPart;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: part.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-sm",
        isDragging && "shadow-lg ring-2 ring-primary"
      )}
    >
      {isAdmin && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-on-surface-variant/40 hover:text-primary transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
              part.name.toLowerCase().includes("coro")
                ? "bg-orange-500/20 text-orange-400"
                : part.name.toLowerCase().includes("verso")
                ? "bg-blue-500/20 text-blue-400"
                : part.name.toLowerCase().includes("puente")
                ? "bg-purple-500/20 text-purple-400"
                : part.name.toLowerCase().includes("intro")
                ? "bg-teal-500/20 text-teal-400"
                : "bg-white/10 text-white/70"
            }`}
          >
            {abbreviateSection(part.name)}
          </span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            {part.name}
          </span>
        </div>
        <div className="text-xs text-on-surface-variant/60 font-mono pl-10 line-clamp-2">
          {part.content.slice(0, 80)}...
        </div>
      </div>
      {isAdmin && (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit} className="w-8 h-8 p-0 rounded-lg">
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="w-8 h-8 p-0 rounded-lg text-destructive hover:bg-destructive/5"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function SongDetailClient({
  song,
  parts,
  versions,
  audioTracks,
  isAdmin,
}: Props) {
  const router = useRouter();

  const defaultVersionId = versions.find((v) => v.is_default)?.id ?? versions[0]?.id ?? null;

  const [localParts, setLocalParts] = useState<SongPart[]>(parts);
  const [localVersions, setLocalVersions] = useState<SongVersion[]>(versions);
  const [localAudioTracks, setLocalAudioTracks] = useState<AudioTrack[]>(audioTracks);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [localSong, setLocalSong] = useState<Song>(song);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(defaultVersionId);
  const [transposition, setTransposition] = useState(0);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredParts = useMemo(() => {
    if (!selectedVersionId) {
      return localParts.filter((p) => !p.version_id);
    }
    return localParts.filter((p) => p.version_id === selectedVersionId);
  }, [localParts, selectedVersionId]);

  const currentKey = useMemo(() => {
    if (transposition === 0) return localSong.original_key;
    return transposeKey(localSong.original_key, transposition);
  }, [localSong.original_key, transposition]);

  const [showAddPart, setShowAddPart] = useState(false);
  const [newPartName, setNewPartName] = useState("");
  const [newPartContent, setNewPartContent] = useState("");

  const [showEditPart, setShowEditPart] = useState(false);
  const [editingPart, setEditingPart] = useState<SongPart | null>(null);
  const [editPartName, setEditPartName] = useState("");
  const [editPartContent, setEditPartContent] = useState("");

  const [showEditSong, setShowEditSong] = useState(false);
  const [editSongData, setEditSongData] = useState({
    title: song.title,
    artist: song.artist,
    original_key: song.original_key,
    tempo: song.tempo?.toString() ?? "",
    tags: (song.tags ?? []).join(", "),
    notes: song.notes ?? "",
    spotify_url: song.spotify_url ?? "",
    youtube_url: song.youtube_url ?? "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showAddVersion, setShowAddVersion] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");

  const [showSaveAsVersion, setShowSaveAsVersion] = useState(false);
  const [saveVersionName, setSaveVersionName] = useState("");

  const changeTransposition = (delta: number) => {
    setTransposition((prev) => {
      const next = prev + delta;
      if (next < -12 || next > 12) return prev;
      return next;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredParts.findIndex((p) => p.id === active.id);
    const newIndex = filteredParts.findIndex((p) => p.id === over.id);

    const newFilteredParts = arrayMove(filteredParts, oldIndex, newIndex);

    setLocalParts((prev) => {
      const otherParts = prev.filter((p) => p.version_id !== selectedVersionId && (selectedVersionId ? p.version_id : !p.version_id));
      return [...otherParts, ...newFilteredParts];
    });

    try {
      await fetch(`/api/songs/${song.id}/parts/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partId: active.id as string,
          newIndex: newIndex,
          versionId: selectedVersionId,
        }),
      });
    } catch (err) {
      console.error("Failed to save order:", err);
    }
  };

  const handleAddPart = async () => {
    if (!newPartName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/songs/${song.id}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPartName.trim(),
          content: newPartContent,
          order_index: filteredParts.length,
          version_id: selectedVersionId,
        }),
      });
      if (res.ok) {
        const created: SongPart = await res.json();
        setLocalParts((prev) => [...prev, created]);
        setNewPartName("");
        setNewPartContent("");
        setShowAddPart(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const openEditPart = (part: SongPart) => {
    setEditingPart(part);
    setEditPartName(part.name);
    setEditPartContent(part.content);
    setShowEditPart(true);
  };

  const handleEditPart = async () => {
    if (!editingPart || !editPartName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/songs/${song.id}/parts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partId: editingPart.id,
          name: editPartName.trim(),
          content: editPartContent,
        }),
      });
      if (res.ok) {
        const updated: SongPart = await res.json();
        setLocalParts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        setShowEditPart(false);
        setEditingPart(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePart = async (partId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/songs/${song.id}/parts?partId=${partId}`, { method: "DELETE" });
      if (res.ok) {
        setLocalParts((prev) => prev.filter((p) => p.id !== partId));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSong = async () => {
    setLoading(true);
    try {
      const tagsArray = editSongData.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await fetch(`/api/songs/${song.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editSongData.title,
          artist: editSongData.artist,
          original_key: editSongData.original_key,
          tempo: editSongData.tempo ? Number(editSongData.tempo) : null,
          tags: tagsArray,
          notes: editSongData.notes || null,
          spotify_url: editSongData.spotify_url || null,
          youtube_url: editSongData.youtube_url || null,
        }),
      });
      if (res.ok) {
        const updated: Song = await res.json();
        setLocalSong(updated);
        setShowEditSong(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSong = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/songs/${song.id}`, { method: "DELETE" });
      if (res.ok) router.push("/songs");
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_type", "multitrack");
      const res = await fetch(`/api/songs/${song.id}/audio`, { method: "POST", body: formData });
      if (res.ok) {
        const newTrack: AudioTrack = await res.json();
        setLocalAudioTracks((prev) => [...prev, newTrack]);
      }
    } finally {
      setUploadingAudio(false);
      e.target.value = "";
    }
  };

  const handleAddVersion = async () => {
    if (!newVersionName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/songs/${song.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newVersionName.trim() }),
      });
      if (res.ok) {
        const created: SongVersion = await res.json();
        setLocalVersions((prev) => [...prev, created]);
        setNewVersionName("");
        setShowAddVersion(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsVersion = async () => {
    if (!saveVersionName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/songs/${song.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveVersionName.trim(),
          copyFromVersionId: selectedVersionId,
        }),
      });
      if (res.ok) {
        const created: SongVersion = await res.json();
        setLocalVersions((prev) => [...prev, created]);
        setSelectedVersionId(created.id);
        setSaveVersionName("");
        setShowSaveAsVersion(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8 space-y-8 max-w-4xl mx-auto">
      <div className="rounded-[32px] border border-outline-variant/20 bg-white p-8 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative">
          <div className="mb-6 flex items-start justify-between">
            <div className="space-y-1">
              <Link href="/songs" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2 hover:translate-x-[-4px] transition-transform">
                <ChevronLeft className="h-4 w-4" />
                Canciones
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface font-headline leading-tight">
                {localSong.title}
              </h1>
              <p className="text-lg font-semibold text-on-surface-variant font-headline">
                {localSong.artist}
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowSaveAsVersion(true)} className="rounded-2xl">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowEditSong(true)} className="rounded-2xl">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)} className="rounded-2xl text-destructive hover:bg-destructive/5 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <SongStructure
            parts={filteredParts}
            onPartClick={(id) => {
              const el = document.getElementById(`part-${id}`);
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <div className="flex flex-wrap gap-3 mt-6">
            <Badge variant="default" className="rounded-lg shadow-sm">
              Tono: {currentKey}
            </Badge>
            {localSong.tempo && (
              <Badge variant="outline" className="rounded-lg border-outline-variant/20">
                {localSong.tempo} BPM
              </Badge>
            )}
            {localSong.has_audio && (
              <Badge variant="outline" className="flex items-center gap-1.5 rounded-lg border-primary/20 text-primary bg-primary/5">
                <AudioLines className="h-3.5 w-3.5" />
                Audio
              </Badge>
            )}
          </div>

          {localSong.tags && localSong.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {localSong.tags.map((tag) => (
                <span key={tag} className="rounded-lg bg-surface-container px-2.5 py-1 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest border border-outline-variant/10">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {(localAudioTracks.length > 0 || isAdmin) && (
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold tracking-tight text-on-surface font-headline flex items-center gap-2">
                  <AudioLines className="h-5 w-5 text-primary" />
                  Audio
                </h3>
                {isAdmin && (
                  <label className={cn(
                    "cursor-pointer text-[11px] font-bold text-primary flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-colors",
                    uploadingAudio && "opacity-50 pointer-events-none"
                  )}>
                    <Plus className="h-3.5 w-3.5" />
                    {uploadingAudio ? "Subiendo..." : "Subir audio"}
                    <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} disabled={uploadingAudio} />
                  </label>
                )}
              </div>
              {localAudioTracks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-outline-variant/30 p-8 text-center">
                  <AudioLines className="h-8 w-8 text-on-surface-variant/20 mx-auto mb-2" />
                  <p className="text-xs font-bold text-on-surface-variant/40">No hay audios. Sube un multitrack para ensayar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {localAudioTracks.map((track) => (
                    <div key={track.id} className="rounded-2xl border border-outline-variant/10 bg-white p-4 shadow-sm">
                      <div className="mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                          {FILE_TYPE_LABELS[track.file_type]}
                        </span>
                      </div>
                      <AudioPlayer src={track.file_url} title={track.file_name} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold tracking-tight text-on-surface font-headline flex items-center gap-2">
                <Music2 className="h-5 w-5 text-primary" />
                Cifrado
              </h3>
            </div>

            {filteredParts.length === 0 ? (
              <div className="rounded-[32px] border border-outline-variant/20 bg-white p-12 text-center shadow-card">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant/20">
                  <Music2 className="h-8 w-8" />
                </div>
                <p className="text-sm font-bold text-on-surface-variant">No hay partes en esta versión</p>
                {isAdmin && (
                  <Button size="sm" variant="secondary" className="mt-4" onClick={() => setShowEditSong(true)}>
                    Editar canción para añadir partes
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <SongPartsDisplay parts={filteredParts} transposition={transposition} />
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-outline-variant/20 bg-white p-6 shadow-card space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Transposición</span>
            <div className="flex items-center justify-between gap-4">
              <button onClick={() => changeTransposition(-1)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-primary transition-all active:scale-90">
                <Minus className="h-5 w-5" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-primary font-headline">
                  {transposition === 0 ? "ORIGINAL" : transposition > 0 ? `+${transposition}` : `${transposition}`}
                </span>
                <span className="text-xs text-on-surface-variant">{currentKey}</span>
              </div>
              <button onClick={() => changeTransposition(1)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-primary transition-all active:scale-90">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            {transposition !== 0 && (
              <Button variant="ghost" size="sm" onClick={() => setTransposition(0)} className="w-full rounded-xl text-on-surface-variant">
                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                Reset
              </Button>
            )}
          </div>

          {localSong.youtube_url && (() => {
            const ytMatch = localSong.youtube_url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
            const videoId = ytMatch?.[1];
            return videoId ? (
              <div className="rounded-[32px] border border-outline-variant/20 bg-white p-6 shadow-card space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Video</span>
                <div className="rounded-2xl overflow-hidden aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            ) : null;
          })()}

          {(localSong.spotify_url || localSong.youtube_url) && (
            <div className="rounded-[32px] border border-outline-variant/20 bg-white p-6 shadow-card space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Enlaces externos</span>
              <div className="grid grid-cols-1 gap-2">
                {localSong.spotify_url && (
                  <a href={localSong.spotify_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-outline-variant/10 bg-surface-container/30 px-4 py-3 text-sm font-bold text-on-surface hover:border-primary/40 hover:bg-white transition-all shadow-sm">
                    <ExternalLink className="h-4 w-4 text-[#1DB954]" />
                    Spotify
                  </a>
                )}
                {localSong.youtube_url && (
                  <a href={localSong.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-outline-variant/10 bg-surface-container/30 px-4 py-3 text-sm font-bold text-on-surface hover:border-primary/40 hover:bg-white transition-all shadow-sm">
                    <ExternalLink className="h-4 w-4 text-[#FF0000]" />
                    YouTube
                  </a>
                )}
              </div>
            </div>
          )}

          {(localVersions.length > 0 || isAdmin) && (
            <div className="rounded-[32px] border border-outline-variant/20 bg-white p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Versiones</span>
                {isAdmin && (
                  <button onClick={() => setShowAddVersion(true)} className="text-primary hover:scale-110 transition-transform">
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {localVersions.length === 0 && (
                  <p className="text-xs text-on-surface-variant italic py-2">No hay versiones alternativas</p>
                )}
                {localVersions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersionId(version.id)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm border",
                      selectedVersionId === version.id
                        ? "bg-primary text-white border-primary shadow-primary-glow"
                        : "bg-surface-container/50 text-on-surface-variant border-outline-variant/10 hover:border-primary/40 hover:bg-white"
                    )}
                  >
                    {version.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {localSong.notes && (
            <div className="rounded-[32px] border border-outline-variant/20 bg-white p-6 shadow-card space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Notas del Director</span>
              <div className="p-4 rounded-2xl bg-surface-container/30 border border-outline-variant/10">
                <p className="whitespace-pre-wrap text-sm text-on-surface-variant font-medium italic">
                  "{localSong.notes}"
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <Modal open={showAddPart} onClose={() => setShowAddPart(false)} title="Añadir parte">
        <div className="space-y-5">
          <Input label="Nombre" placeholder="Ej: Verso 1, Coro, Puente..." value={newPartName} onChange={(e) => setNewPartName(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Contenido (Cifrado)</label>
            <textarea value={newPartContent} onChange={(e) => setNewPartContent(e.target.value)} placeholder="[La]Cantaré de Tu bondad&#10;[Mi]Esperaré en Ti" rows={10} className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container/20 px-4 py-3 font-mono text-sm text-on-surface placeholder-on-surface-variant/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all" />
            <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider ml-1">Usa corchetes para acordes: [La]</p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setShowAddPart(false)}>Cancelar</Button>
            <Button className="flex-1 rounded-xl" onClick={handleAddPart} disabled={loading || !newPartName.trim()}>
              {loading ? "Añadiendo..." : "Añadir"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={showEditPart} onClose={() => setShowEditPart(false)} title="Editar parte">
        <div className="space-y-5">
          <Input label="Nombre" value={editPartName} onChange={(e) => setEditPartName(e.target.value)} />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Contenido</label>
            <textarea value={editPartContent} onChange={(e) => setEditPartContent(e.target.value)} rows={10} className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container/20 px-4 py-3 font-mono text-sm text-on-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all" />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setShowEditPart(false)}>Cancelar</Button>
            <Button className="flex-1 rounded-xl" onClick={handleEditPart} disabled={loading || !editPartName.trim()}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showEditSong} onClose={() => setShowEditSong(false)} title="Editar canción">
        <div className="space-y-5 max-h-[80vh] overflow-y-auto px-1 custom-scrollbar">
          <Input label="Título" value={editSongData.title} onChange={(e) => setEditSongData({ ...editSongData, title: e.target.value })} />
          <Input label="Artista" value={editSongData.artist} onChange={(e) => setEditSongData({ ...editSongData, artist: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tonalidad" value={editSongData.original_key} onChange={(e) => setEditSongData({ ...editSongData, original_key: e.target.value })} options={SPANISH_KEYS.map((k) => ({ value: k, label: k }))} />
            <Input label="Tempo (BPM)" type="number" value={editSongData.tempo} onChange={(e) => setEditSongData({ ...editSongData, tempo: e.target.value })} />
          </div>
          <Input label="Etiquetas (coma)" value={editSongData.tags} onChange={(e) => setEditSongData({ ...editSongData, tags: e.target.value })} />
          <Textarea label="Notas" value={editSongData.notes} onChange={(e) => setEditSongData({ ...editSongData, notes: e.target.value })} />
          <Input label="Spotify URL" value={editSongData.spotify_url} onChange={(e) => setEditSongData({ ...editSongData, spotify_url: e.target.value })} placeholder="https://open.spotify.com/track/..." />
          <Input label="YouTube URL" value={editSongData.youtube_url} onChange={(e) => setEditSongData({ ...editSongData, youtube_url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
          <div className="flex gap-4 pt-2">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setShowEditSong(false)}>Cancelar</Button>
            <Button className="flex-1 rounded-xl" onClick={handleEditSong} disabled={loading}>Guardar</Button>
          </div>

          {/* Parts Management */}
          <div className="pt-4 border-t border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-on-surface">Partes del cifrado</span>
              <Button size="sm" variant="ghost" onClick={() => setShowAddPart(true)} className="rounded-xl text-primary font-bold">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Añadir
              </Button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredParts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {filteredParts.length === 0 && (
                    <p className="text-xs text-on-surface-variant italic text-center py-4">No hay partes. Añade la primera.</p>
                  )}
                  {filteredParts.map((part) => (
                    <div key={part.id} id={`part-${part.id}`}>
                      <SortablePart
                        part={part}
                        isAdmin={isAdmin}
                        onEdit={() => openEditPart(part)}
                        onDelete={() => handleDeletePart(part.id)}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </Modal>

      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Eliminar canción">
        <div className="space-y-6 text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
            <Trash2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-bold text-on-surface font-headline">¿Estás seguro?</p>
            <p className="text-sm text-on-surface-variant font-medium">
              Vas a eliminar permanentemente <span className="font-bold text-on-surface">{localSong.title}</span>.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
            <Button variant="destructive" className="flex-1 rounded-xl shadow-destructive-glow" onClick={handleDeleteSong} disabled={loading}>Eliminar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showAddVersion} onClose={() => setShowAddVersion(false)} title="Nueva versión">
        <div className="space-y-5">
          <Input label="Nombre de la versión" placeholder="Ej: Versión Acústica, Remix..." value={newVersionName} onChange={(e) => setNewVersionName(e.target.value)} />
          <div className="flex gap-4 pt-4">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setShowAddVersion(false)}>Cancelar</Button>
            <Button className="flex-1 rounded-xl" onClick={handleAddVersion} disabled={loading || !newVersionName.trim()}>Añadir</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showSaveAsVersion} onClose={() => setShowSaveAsVersion(false)} title="Guardar como nueva versión">
        <div className="space-y-5">
          <p className="text-sm text-on-surface-variant">
            Esto copiará el orden actual de las partes a una nueva versión. La versión original no se modifica.
          </p>
          <Input label="Nombre de la versión" placeholder="Ej: Versión para domingo..." value={saveVersionName} onChange={(e) => setSaveVersionName(e.target.value)} />
          <div className="flex gap-4 pt-4">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setShowSaveAsVersion(false)}>Cancelar</Button>
            <Button className="flex-1 rounded-xl" onClick={handleSaveAsVersion} disabled={loading || !saveVersionName.trim()}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}