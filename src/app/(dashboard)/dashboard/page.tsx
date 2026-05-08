import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { CalendarDays, Music, Calendar, Users, MapPin, Clock, ChevronRight } from "lucide-react";
import { createServiceClient } from "@/lib/supabase";

type EventType =
  | "servicio_dominical"
  | "ensayo"
  | "evento_especial"
  | "servicio_jovenes"
  | "otro";

const eventTypeColors: Record<EventType, string> = {
  servicio_dominical: "bg-primary-container/40 text-primary border-primary/20",
  ensayo: "bg-emerald-50 text-emerald-600 border-emerald-100",
  evento_especial: "bg-amber-50 text-amber-600 border-amber-100",
  servicio_jovenes: "bg-rose-50 text-rose-600 border-rose-100",
  otro: "bg-surface-container text-on-surface-variant border-outline-variant/30",
};

const eventTypeLabels: Record<EventType, string> = {
  servicio_dominical: "Servicio dominical",
  ensayo: "Ensayo",
  evento_especial: "Evento especial",
  servicio_jovenes: "Servicio jóvenes",
  otro: "Otro",
};

function getEventColors(eventType: string): string {
  return eventTypeColors[eventType as EventType] ?? eventTypeColors.otro;
}

function getEventLabel(eventType: string): string {
  return eventTypeLabels[eventType as EventType] ?? "Evento";
}

function formatEventDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":");
  return `${h}:${m}`;
}

interface Event {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  start_time: string | null;
  location: string | null;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const clerkUser = await currentUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", userId)
    .single();

  const displayName =
    profile?.full_name || clerkUser?.firstName || "Usuario";
  const isAdmin = profile?.role === "admin" || profile?.role === "leader";

  const today = new Date().toISOString().split("T")[0];

  let events: Event[] = [];

  if (isAdmin) {
    const { data } = await supabase
      .from("events")
      .select("id, title, event_type, event_date, start_time, location")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(5);
    events = data ?? [];
  } else {
    const { data: assignments } = await supabase
      .from("event_team")
      .select("event_id")
      .eq("profile_id", userId);

    const eventIds = (assignments ?? []).map(
      (a: { event_id: string }) => a.event_id
    );

    if (eventIds.length > 0) {
      const { data } = await supabase
        .from("events")
        .select("id, title, event_type, event_date, start_time, location")
        .in("id", eventIds)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(5);
      events = data ?? [];
    }
  }

  const upcomingEvents = events.slice(0, 3);

  const quickLinks = [
    { href: "/events", icon: CalendarDays, label: "Eventos", color: "text-primary" },
    { href: "/songs", icon: Music, label: "Canciones", color: "text-secondary" },
    { href: "/calendar", icon: Calendar, label: "Calendario", color: "text-emerald-500" },
    { href: "/team", icon: Users, label: "Equipo", color: "text-amber-500" },
  ];

  return (
    <div className="px-4 py-8 space-y-8 max-w-4xl mx-auto">
      {/* Greeting */}
      <section className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface font-headline">
          Hola, {displayName} 👋
        </h1>
        <p className="text-body-md text-on-surface-variant font-medium">
          Tu dashboard para este fin de semana.
        </p>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-on-surface font-headline">
            Próximos Eventos
          </h2>
          <Link
            href="/events"
            className="text-sm font-semibold text-primary hover:opacity-70 transition-opacity"
          >
            Ver todos
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="rounded-3xl border border-outline-variant/30 bg-white p-10 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
              <CalendarDays className="h-8 w-8" />
            </div>
            <p className="text-body-md text-on-surface-variant font-semibold">No hay eventos próximos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group flex flex-col bg-white rounded-3xl border border-outline-variant/20 shadow-card hover:shadow-card-md transition-all duration-300 overflow-hidden"
              >
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${getEventColors(event.event_type)}`}>
                      {getEventLabel(event.event_type)}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container group-hover:bg-primary-container group-hover:text-primary transition-colors duration-300">
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors truncate font-headline">
                    {event.title}
                  </h3>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-on-surface capitalize">
                        {formatEventDate(event.event_date)}
                      </span>
                    </div>
                    {event.start_time && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-on-surface">
                          {formatTime(event.start_time)}
                        </span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-on-surface truncate">
                          {event.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Access Grid */}
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-on-surface font-headline">
          Acceso rápido
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center gap-4 rounded-3xl border border-outline-variant/20 bg-white p-6 text-center transition-all duration-300 shadow-card hover:shadow-card-md hover:border-primary/30"
            >
              <div className="p-4 rounded-2xl bg-surface-container group-hover:bg-primary-container transition-colors duration-300 shadow-sm">
                <item.icon
                  className={`h-8 w-8 transition-transform duration-300 group-hover:scale-110 ${item.color}`}
                />
              </div>
              <span className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
