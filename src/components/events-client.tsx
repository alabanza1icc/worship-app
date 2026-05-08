"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Music, ChevronRight, Plus } from "lucide-react";
import { Button, Badge, Modal } from "@/components/ui";
import { Input, Select, Textarea } from "@/components/ui";

interface EventItem {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  start_time: string | null;
  location: string | null;
  is_live: boolean;
  is_published: boolean;
  song_count: number;
}

interface CreateEventPayload {
  title: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  location?: string;
  description?: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  servicio_dominical: "Servicio Dominical",
  ensayo: "Ensayo",
  evento_especial: "Evento Especial",
  servicio_jovenes: "Servicio de Jóvenes",
  otro: "Otro",
};

const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

const EVENT_TYPE_COLORS: Record<string, string> = {
  servicio_dominical: "bg-primary-container/40 text-primary border-primary/20",
  ensayo: "bg-emerald-50 border-emerald-200 text-emerald-700",
  evento_especial: "bg-amber-50 border-amber-200 text-amber-700",
  servicio_jovenes: "bg-rose-50 border-rose-200 text-rose-700",
  otro: "bg-surface-container border-outline-variant/30 text-on-surface-variant",
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
};

const todayStr = new Date().toISOString().split("T")[0];

interface EventsClientProps {
  events: EventItem[];
  isAdmin: boolean;
}

export function EventsClient({ events: initialEvents, isAdmin }: EventsClientProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("servicio_dominical");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  const upcomingEvents = events.filter((e) => e.event_date >= todayStr);
  const pastEvents = events.filter((e) => e.event_date < todayStr);
  const displayedEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  const resetForm = () => {
    setTitle(""); setEventType("servicio_dominical"); setEventDate("");
    setStartTime(""); setEndTime(""); setLocation(""); setDescription(""); setFormError("");
  };

  const handleClose = () => { setShowCreateModal(false); resetForm(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || !startTime) {
      setFormError("Título, fecha y hora de inicio son requeridos.");
      return;
    }
    setLoading(true);
    setFormError("");

    const payload: CreateEventPayload = {
      title: title.trim(), event_type: eventType, event_date: eventDate, start_time: startTime,
    };
    if (endTime) payload.end_time = endTime;
    if (location.trim()) payload.location = location.trim();
    if (description.trim()) payload.description = description.trim();

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error al crear evento" }));
        setFormError(err.error ?? "Error al crear evento");
        return;
      }
      const created = (await res.json()) as EventItem;
      setEvents((prev) =>
        [...prev, { ...created, song_count: 0 }].sort((a, b) =>
          a.event_date.localeCompare(b.event_date)
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
        <h1 className="text-3xl font-bold tracking-tight text-on-surface font-headline">Eventos</h1>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="rounded-2xl">
            <Plus className="h-5 w-5 mr-1" />
            Nuevo
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 rounded-[20px] bg-surface-container border border-outline-variant/10">
        {(["upcoming", "past"] as const).map((tab) => {
          const count = tab === "upcoming" ? upcomingEvents.length : pastEvents.length;
          const label = tab === "upcoming" ? "Próximos" : "Pasados";
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-[14px] py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-white text-primary shadow-sm ring-1 ring-outline-variant/10"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 gap-4">
        {displayedEvents.length === 0 ? (
          <div className="rounded-[32px] border border-outline-variant/20 bg-white p-12 text-center shadow-card">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-container text-on-surface-variant/40">
              <CalendarDays className="h-10 w-10" />
            </div>
            <p className="text-lg font-bold text-on-surface font-headline mb-2">
              {activeTab === "upcoming" ? "No hay eventos próximos" : "No hay eventos pasados"}
            </p>
            <p className="text-sm font-medium text-on-surface-variant mb-8">
              {activeTab === "upcoming" ? "Comienza planificando tu próximo servicio." : "Los eventos pasados aparecerán aquí."}
            </p>
            {isAdmin && activeTab === "upcoming" && (
              <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
                Crear primer evento
              </Button>
            )}
          </div>
        ) : (
          displayedEvents.map((event) => {
            const typeColor = EVENT_TYPE_COLORS[event.event_type] ?? EVENT_TYPE_COLORS.otro;
            return (
              <Link key={event.id} href={`/events/${event.id}`} className="group">
                <div className="rounded-[28px] border border-outline-variant/20 bg-white p-6 transition-all duration-300 shadow-card hover:shadow-card-md hover:border-primary/30">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${typeColor}`}>
                          {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
                        </span>
                        {event.is_live && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider border border-destructive/10">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                            En vivo
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-on-surface leading-tight truncate font-headline group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-primary transition-all duration-300">
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary/70">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-on-surface capitalize">
                        {formatDate(event.event_date)}
                      </span>
                    </div>
                    {event.start_time && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary/70">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-on-surface">
                          {event.start_time.substring(0, 5)}
                        </span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary/70">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-on-surface truncate">
                          {event.location}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 ml-auto">
                      <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-primary">
                        <Music className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {event.song_count} <span className="font-medium text-[10px] uppercase opacity-70 ml-0.5">Canciones</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Create Event Modal */}
      <Modal open={showCreateModal} onClose={handleClose} title="Nuevo Evento">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Título *"
            type="text"
            placeholder="Ej: Servicio del domingo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Select
            label="Tipo de evento"
            options={EVENT_TYPE_OPTIONS}
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          />
          <Input
            label="Fecha *"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora inicio *"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="Hora fin"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <Input
            label="Ubicación"
            type="text"
            placeholder="Ej: Auditorio principal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Textarea
            label="Descripción"
            placeholder="Notas o descripción del evento..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {formError && <p className="text-xs font-bold text-destructive ml-1">{formError}</p>}
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creando..." : "Crear evento"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
