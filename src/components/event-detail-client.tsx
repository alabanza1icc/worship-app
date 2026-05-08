"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  MapPin,
  Music,
  Users,
  BookOpen,
  Radio,
  ChevronLeft,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
  Send,
  Scroll,
  MoreVertical,
} from "lucide-react";
import { Button, Input, Textarea, Select, Card, Badge, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: "admin" | "participant" | "musician" | "multimedia";
  instrument: string | null;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  original_key: string;
  tempo: number | null;
  has_audio: boolean;
}

interface SongPart {
  id: string;
  song_id: string;
  name: string;
  content: string;
  order_index: number;
}

interface EventSong {
  id: string;
  event_id: string;
  song_id: string;
  custom_key: string | null;
  director_notes: string | null;
  order_index: number;
  song?: Song & { song_parts: SongPart[] };
}

interface EventTeamMember {
  id: string;
  event_id: string;
  profile_id: string;
  role_type: string;
  status: "confirmed" | "pending" | "declined";
  notes: string | null;
  profile?: Profile;
}

interface Sermon {
  id: string;
  event_id: string;
  title: string;
  preacher: string;
  content: string;
  scripture_reference: string | null;
}

interface EventData {
  id: string;
  title: string;
  event_type:
    | "servicio_dominical"
    | "ensayo"
    | "evento_especial"
    | "servicio_jovenes"
    | "otro";
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  description: string | null;
  is_live: boolean;
  is_published: boolean;
}

interface Bosquejo {
  id: string;
  q1_respuesta: string;
  q2_respuesta: string;
  notas_adicionales: string | null;
  email_enviado: boolean;
  email_enviado_at: string | null;
}

interface Props {
  event: EventData;
  eventSongs: EventSong[];
  eventTeam: EventTeamMember[];
  sermon: Sermon | null;
  bosquejo: Bosquejo | null;
  isAdmin: boolean;
  isLeader: boolean;
  allSongs: Pick<Song, "id" | "title" | "artist" | "original_key">[];
  allProfiles: Pick<Profile, "id" | "full_name" | "role" | "instrument">[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<string, string> = {
  servicio_dominical: "Servicio Dominical",
  ensayo: "Ensayo",
  evento_especial: "Evento Especial",
  servicio_jovenes: "Servicio de Jóvenes",
  otro: "Otro",
};

const ROLE_TYPE_LABELS: Record<string, string> = {
  lead_singer: "Voz Principal",
  background_vocals: "Coros",
  guitar: "Guitarra",
  bass: "Bajo",
  drums: "Batería",
  piano: "Piano",
  keys: "Teclados",
  multimedia: "Multimedia",
  dance: "Danza",
};

const ROLE_TYPE_OPTIONS = Object.entries(ROLE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

function statusBadgeVariant(status: "confirmed" | "pending" | "declined") {
  if (status === "confirmed") return "success";
  if (status === "pending") return "warning";
  return "destructive";
}

function statusLabel(status: "confirmed" | "pending" | "declined"): string {
  if (status === "confirmed") return "Confirmado";
  if (status === "pending") return "Pendiente";
  return "Declinado";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EventDetailClient({
  event,
  eventSongs: initialEventSongs,
  eventTeam: initialEventTeam,
  sermon: initialSermon,
  bosquejo: initialBosquejo,
  isAdmin,
  isLeader,
  allSongs,
  allProfiles,
}: Props) {
  const router = useRouter();
  const canManageEvent = isAdmin || isLeader;

  // Local state
  const [songs, setSongs] = useState<EventSong[]>(initialEventSongs);
  const [team, setTeam] = useState<EventTeamMember[]>(initialEventTeam);
  const [sermonData, setSermonData] = useState<Sermon | null>(initialSermon);
  const [bosquejoData, setBosquejoData] = useState<Bosquejo | null>(initialBosquejo);
  const [isLive, setIsLive] = useState(event.is_live);
  const [loading, setLoading] = useState(false);

  // Expanded song parts
  const [expandedSongs, setExpandedSongs] = useState<Set<string>>(new Set());

  // Modal states
  const [showAddSong, setShowAddSong] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showSermonForm, setShowSermonForm] = useState(false);
  const [showBosquejoForm, setShowBosquejoForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: "event" | "song" | "team";
    id: string;
  } | null>(null);

  // Bosquejo form state
  const [bosquejoForm, setBosquejoForm] = useState({
    q1_respuesta: bosquejoData?.q1_respuesta ?? "",
    q2_respuesta: bosquejoData?.q2_respuesta ?? "",
    notas_adicionales: bosquejoData?.notas_adicionales ?? "",
  });
  const [sendingBosquejoEmail, setSendingBosquejoEmail] = useState(false);

  // Add song modal state
  const [songSearch, setSongSearch] = useState("");
  const [selectedSongId, setSelectedSongId] = useState("");

  // Add team modal state
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [selectedRoleType, setSelectedRoleType] = useState("guitar");

  // Edit event form state
  const [editForm, setEditForm] = useState({
    title: event.title,
    event_type: event.event_type,
    event_date: event.event_date,
    start_time: event.start_time,
    end_time: event.end_time ?? "",
    location: event.location ?? "",
    description: event.description ?? "",
  });

  // Sermon form state
  const [sermonForm, setSermonForm] = useState({
    title: sermonData?.title ?? "",
    preacher: sermonData?.preacher ?? "",
    content: sermonData?.content ?? "",
    scripture_reference: sermonData?.scripture_reference ?? "",
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function toggleSongExpand(id: string) {
    setExpandedSongs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleToggleLive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/live`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_live: !isLive }),
      });
      if (res.ok) {
        setIsLive(!isLive);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSong() {
    if (!selectedSongId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song_id: selectedSongId }),
      });
      if (res.ok) {
        const data = (await res.json()) as EventSong;
        setSongs([...songs, data]);
        setShowAddSong(false);
        setSelectedSongId("");
        setSongSearch("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveSong(eventSongId: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/events/${event.id}/songs?eventSongId=${eventSongId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setSongs(songs.filter((s) => s.id !== eventSongId));
        setShowDeleteConfirm(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTeam() {
    if (!selectedProfileId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: selectedProfileId,
          role_type: selectedRoleType,
          status: "pending",
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as EventTeamMember;
        setTeam([...team, data]);
        setShowAddTeam(false);
        setSelectedProfileId("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveTeam(eventTeamId: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/events/${event.id}/team?eventTeamId=${eventTeamId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setTeam(team.filter((m) => m.id !== eventTeamId));
        setShowDeleteConfirm(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEditEvent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          end_time: editForm.end_time || null,
          location: editForm.location || null,
          description: editForm.description || null,
        }),
      });
      if (res.ok) {
        setShowEditEvent(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEvent() {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/events");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSermonSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const method = sermonData ? "PATCH" : "POST";
      const body = sermonData
        ? { sermonId: sermonData.id, ...sermonForm }
        : sermonForm;
      const res = await fetch(`/api/events/${event.id}/sermons`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = (await res.json()) as Sermon;
        setSermonData(data);
        setShowSermonForm(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBosquejoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/bosquejo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q1_respuesta: bosquejoForm.q1_respuesta,
          q2_respuesta: bosquejoForm.q2_respuesta,
          notas_adicionales: bosquejoForm.notas_adicionales || null,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as Bosquejo;
        setBosquejoData(data);
        setShowBosquejoForm(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSendBosquejoEmail() {
    setSendingBosquejoEmail(true);
    try {
      await fetch(`/api/events/${event.id}/bosquejo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      setBosquejoData((prev) => prev ? { ...prev, email_enviado: true } : prev);
    } finally {
      setSendingBosquejoEmail(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!showDeleteConfirm) return;
    if (showDeleteConfirm.type === "event") {
      await handleDeleteEvent();
    } else if (showDeleteConfirm.type === "song") {
      await handleRemoveSong(showDeleteConfirm.id);
    } else if (showDeleteConfirm.type === "team") {
      await handleRemoveTeam(showDeleteConfirm.id);
    }
  }

  // ─── Filtered songs for modal ────────────────────────────────────────────────

  const filteredSongs = allSongs.filter(
    (s) =>
      s.title.toLowerCase().includes(songSearch.toLowerCase()) ||
      s.artist.toLowerCase().includes(songSearch.toLowerCase())
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 py-8 space-y-8 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="rounded-[32px] border border-outline-variant/20 bg-white p-8 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="relative">
          <div className="mb-6 flex items-start justify-between">
            <div className="space-y-1">
              <Link href="/events" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2 hover:translate-x-[-4px] transition-transform">
                <ChevronLeft className="h-4 w-4" />
                Eventos
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface font-headline leading-tight">
                {event.title}
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-lg border-primary/20 text-primary">
                  {EVENT_TYPE_LABELS[event.event_type]}
                </Badge>
                {isLive && (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/10 animate-pulse">
                    En Vivo
                  </Badge>
                )}
              </div>
            </div>
            
            {canManageEvent && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowEditEvent(true)} className="rounded-2xl">
                  <Edit className="h-4 w-4" />
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm({ type: "event", id: event.id })} className="rounded-2xl text-destructive hover:bg-destructive/5 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Fecha</span>
                <span className="text-sm font-bold text-on-surface capitalize">{formatDate(event.event_date)}</span>
              </div>
            </div>
            {event.start_time && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Horario</span>
                  <span className="text-sm font-bold text-on-surface">
                    {formatTime(event.start_time)} {event.end_time && `– ${formatTime(event.end_time)}`}
                  </span>
                </div>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ubicación</span>
                  <span className="text-sm font-bold text-on-surface truncate">{event.location}</span>
                </div>
              </div>
            )}
          </div>
          
          {event.description && (
            <div className="mt-6 p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/10">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {event.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions / Live Mode */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <div className="flex-1 rounded-[24px] border border-outline-variant/20 bg-white p-5 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
              isLive ? "bg-destructive shadow-destructive-glow text-white" : "bg-surface-container text-on-surface-variant"
            )}>
              <Radio className={cn("h-6 w-6", isLive && "animate-pulse")} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-on-surface">Estado En Vivo</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                {isLive ? "Transmitiendo a equipo" : "Listo para iniciar"}
              </span>
            </div>
          </div>
          {canManageEvent && (
            <Button
              size="sm"
              variant={isLive ? "destructive" : "secondary"}
              onClick={handleToggleLive}
              disabled={loading}
              className="rounded-xl px-5"
            >
              {isLive ? "Detener" : "Activar"}
            </Button>
          )}
        </div>
        <Link href={`/live/${event.id}`} className="sm:w-48">
          <Button className="w-full h-full rounded-[24px] shadow-primary-glow flex flex-col gap-1 py-4">
            <Scroll className="h-6 w-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Abrir En Vivo</span>
          </Button>
        </Link>
      </div>

      {/* Setlist Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold tracking-tight text-on-surface font-headline flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Setlist
          </h3>
          {canManageEvent && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAddSong(true)}
              className="rounded-xl text-primary font-bold"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Añadir
            </Button>
          )}
        </div>

        {songs.length === 0 ? (
          <div className="rounded-[32px] border border-outline-variant/20 bg-white p-12 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant/20">
              <Music className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-on-surface-variant">No hay canciones en el setlist</p>
            {canManageEvent && (
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => setShowAddSong(true)}>
                Agregar primera canción
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {songs.map((es, index) => {
              const key = es.custom_key ?? es.song?.original_key ?? "—";
              const parts = es.song?.song_parts ?? [];
              const isExpanded = expandedSongs.has(es.id);
              return (
                <div
                  key={es.id}
                  className="group rounded-[28px] border border-outline-variant/20 bg-white transition-all duration-300 shadow-card hover:shadow-card-md"
                >
                  <div className="flex items-center gap-4 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-primary-glow text-sm font-bold text-white font-headline">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                        {es.song?.title ?? "Canción"}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-semibold text-on-surface-variant truncate">
                          {es.song?.artist ?? ""}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Tono:</span>
                          <span className="text-xs font-bold text-primary">{key}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {parts.length > 0 && (
                        <button
                          onClick={() => toggleSongExpand(es.id)}
                          className={cn(
                            "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                            isExpanded ? "bg-primary-container text-primary" : "text-on-surface-variant hover:bg-surface-container"
                          )}
                        >
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      )}
                      {canManageEvent && (
                        <button
                          onClick={() => setShowDeleteConfirm({ type: "song", id: es.id })}
                          className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-destructive/5 hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chord preview */}
                  {isExpanded && parts.length > 0 && (
                    <div className="border-t border-outline-variant/10 p-6 space-y-6 bg-surface-container/20">
                      {parts
                        .slice()
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((part) => (
                          <div key={part.id} className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                              {part.name}
                            </h4>
                            <pre className="whitespace-pre-wrap font-mono text-xs text-on-surface-variant leading-relaxed">
                              {part.content}
                            </pre>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Team Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold tracking-tight text-on-surface font-headline flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Equipo
          </h3>
          {canManageEvent && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAddTeam(true)}
              className="rounded-xl text-primary font-bold"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Asignar
            </Button>
          )}
        </div>

        {team.length === 0 ? (
          <div className="rounded-[32px] border border-outline-variant/20 bg-white p-12 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant/20">
              <Users className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-on-surface-variant">No hay equipo asignado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((member) => {
              const name = member.profile?.full_name ?? "—";
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 rounded-[28px] border border-outline-variant/20 bg-white p-4 shadow-card hover:shadow-card-md transition-all duration-300"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-primary font-bold font-headline shadow-sm">
                    {getInitials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-on-surface truncate">{name}</div>
                    <div className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mt-0.5">
                      {ROLE_TYPE_LABELS[member.role_type] ?? member.role_type}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusBadgeVariant(member.status)} className="rounded-lg">
                      {statusLabel(member.status)}
                    </Badge>
                    {canManageEvent && (
                      <button
                        onClick={() => setShowDeleteConfirm({ type: "team", id: member.id })}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-destructive/5 hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sermon Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold tracking-tight text-on-surface font-headline flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Prédica
          </h3>
          {canManageEvent && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSermonForm(true)}
              className="rounded-xl text-primary font-bold"
            >
              {sermonData ? <Edit className="mr-1.5 h-4 w-4" /> : <Plus className="mr-1.5 h-4 w-4" />}
              {sermonData ? "Editar" : "Crear"}
            </Button>
          )}
        </div>

        {!sermonData ? (
          <div className="rounded-[32px] border border-outline-variant/20 bg-white p-12 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant/20">
              <BookOpen className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-on-surface-variant">No hay información de la prédica</p>
          </div>
        ) : (
          <div className="rounded-[32px] border border-outline-variant/20 bg-white p-8 shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12" />
            <div className="relative space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-on-surface font-headline mb-2">{sermonData.title}</h4>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface font-bold text-xs shadow-sm">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    {sermonData.preacher}
                  </div>
                  {sermonData.scripture_reference && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-container/40 text-primary font-bold text-xs border border-primary/10 shadow-sm">
                      <BookOpen className="h-3.5 w-3.5" />
                      {sermonData.scripture_reference}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 rounded-[24px] bg-surface-container/30 border border-outline-variant/10 text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
                {sermonData.content}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Modals ───────────────────────────────────────────────────────────────── */}

      {/* Add Song Modal */}
      <Modal open={showAddSong} onClose={() => setShowAddSong(false)} title="Añadir al Setlist">
        <div className="space-y-5">
          <div className="relative">
            <Input
              placeholder="Buscar canciones..."
              value={songSearch}
              onChange={(e) => setSongSearch(e.target.value)}
              className="pl-10"
            />
            <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/40" />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredSongs.length === 0 ? (
              <p className="text-center py-8 text-sm text-on-surface-variant italic">No se encontraron canciones</p>
            ) : (
              filteredSongs.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSongId(s.id)}
                  className={cn(
                    "w-full flex flex-col items-start p-4 rounded-2xl border transition-all duration-300",
                    selectedSongId === s.id
                      ? "border-primary bg-primary-container/40 shadow-sm"
                      : "border-outline-variant/20 bg-white hover:border-primary/40 hover:bg-surface-container/40"
                  )}
                >
                  <span className="font-bold text-on-surface text-sm">{s.title}</span>
                  <span className="text-xs font-semibold text-on-surface-variant">{s.artist} • {s.original_key}</span>
                </button>
              ))
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setShowAddSong(false)}>Cancelar</Button>
            <Button className="flex-1 rounded-xl" onClick={handleAddSong} disabled={loading || !selectedSongId}>
              {loading ? "Añadiendo..." : "Añadir canción"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Team Modal */}
      <Modal open={showAddTeam} onClose={() => setShowAddTeam(false)} title="Asignar al Equipo">
        <div className="space-y-5">
          <Select
            label="Miembro"
            options={allProfiles.map(p => ({ value: p.id, label: `${p.full_name} (${p.instrument || 'Sin instrumento'})` }))}
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
          />
          <Select
            label="Rol en el evento"
            options={ROLE_TYPE_OPTIONS}
            value={selectedRoleType}
            onChange={(e) => setSelectedRoleType(e.target.value)}
          />
          <div className="flex gap-4 pt-4">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setShowAddTeam(false)}>Cancelar</Button>
            <Button className="flex-1 rounded-xl" onClick={handleAddTeam} disabled={loading || !selectedProfileId}>
              {loading ? "Asignando..." : "Asignar"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Event Modal */}
      <Modal open={showEditEvent} onClose={() => setShowEditEvent(false)} title="Editar Evento">
        <form onSubmit={handleEditEvent} className="space-y-5">
          <Input label="Título" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
          <Select label="Tipo" options={EVENT_TYPE_OPTIONS} value={editForm.event_type} onChange={(e) => setEditForm({ ...editForm, event_type: e.target.value as any })} />
          <Input label="Fecha" type="date" value={editForm.event_date} onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hora Inicio" type="time" value={editForm.start_time} onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })} required />
            <Input label="Hora Fin" type="time" value={editForm.end_time} onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })} />
          </div>
          <Input label="Ubicación" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
          <Textarea label="Descripción" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="ghost" className="flex-1 rounded-xl" onClick={() => setShowEditEvent(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>{loading ? "Guardando..." : "Guardar Cambios"}</Button>
          </div>
        </form>
      </Modal>

      {/* Sermon Form Modal */}
      <Modal open={showSermonForm} onClose={() => setShowSermonForm(false)} title={sermonData ? "Editar Prédica" : "Crear Prédica"}>
        <form onSubmit={handleSermonSubmit} className="space-y-5">
          <Input label="Título" value={sermonForm.title} onChange={(e) => setSermonForm({ ...sermonForm, title: e.target.value })} required />
          <Input label="Predicador" value={sermonForm.preacher} onChange={(e) => setSermonForm({ ...sermonForm, preacher: e.target.value })} required />
          <Input label="Citas Bíblicas" value={sermonForm.scripture_reference} onChange={(e) => setSermonForm({ ...sermonForm, scripture_reference: e.target.value })} placeholder="Ej: Juan 3:16" />
          <Textarea label="Contenido/Bosquejo" value={sermonForm.content} onChange={(e) => setSermonForm({ ...sermonForm, content: e.target.value })} className="min-h-[200px]" required />
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="ghost" className="flex-1 rounded-xl" onClick={() => setShowSermonForm(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirmar Eliminación">
        <div className="space-y-6 text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
            <Trash2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-bold text-on-surface font-headline">¿Estás completamente seguro?</p>
            <p className="text-sm text-on-surface-variant font-medium">
              Esta acción no se puede deshacer. Se eliminará permanentemente de este evento.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setShowDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" className="flex-1 rounded-xl shadow-destructive-glow" onClick={handleDeleteConfirm} disabled={loading}>
              {loading ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
