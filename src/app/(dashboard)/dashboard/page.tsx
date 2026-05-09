import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  CalendarDays,
  Music,
  Users,
  Clock,
  ChevronRight,
  Guitar,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import { createServiceClient } from "@/lib/supabase";
import { Card } from "@/components/ui";
import { DashboardAttendanceButtons } from "@/components/dashboard-attendance-buttons";

interface Event {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  start_time: string | null;
  location: string | null;
}

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

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const clerkUser = await currentUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, instrument, onboarding_completed")
    .eq("id", userId)
    .single();

  // Redirect to onboarding if not completed
  if (profile && profile.onboarding_completed === false) {
    redirect("/onboarding");
  }

  const displayName = profile?.full_name || clerkUser?.firstName || "Usuario";
  const userInstrument = profile?.instrument || "Colaborador";

  // Find next upcoming event this user is assigned to
  const today = new Date().toISOString().split("T")[0];

  const { data: assignments } = await supabase
    .from("event_team")
    .select("id, event_id, role_type, status")
    .eq("profile_id", userId);

  const eventIds = (assignments ?? []).map((a) => a.event_id);

  let nextEvent: (Event & { role_type: string; status: string; teamId: string }) | null = null;

  if (eventIds.length > 0) {
    const { data: eventData } = await supabase
      .from("events")
      .select("id, title, event_type, event_date, start_time, location")
      .in("id", eventIds)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(1)
      .single();

    if (eventData) {
      const assignment = assignments!.find((a) => a.event_id === eventData.id);
      nextEvent = {
        ...eventData,
        role_type: assignment?.role_type ?? "",
        status: assignment?.status ?? "pending",
        teamId: assignment?.id ?? "",
      };
    }
  }

  // Fallback to next any event if not assigned to any upcoming one
  if (!nextEvent) {
    const { data: latestEvent } = await supabase
      .from("events")
      .select("id, title, event_type, event_date, start_time, location")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(1)
      .single();
    if (latestEvent) {
      nextEvent = {
        ...latestEvent,
        role_type: "",
        status: "pending",
        teamId: "",
      };
    }
  }

  // Upcoming events for the list (next 3)
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, title, event_type, event_date, start_time, location")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(3);

  const getMonthAbbr = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", { month: "short" }).toUpperCase().replace(".", "");
  };

  const getDayNum = (dateStr: string) => dateStr.split("-")[2];

  const quickLinks = [
    { href: "/songs", icon: Music, label: "Canciones", color: "text-primary", bg: "bg-primary/10" },
    { href: "/team", icon: Users, label: "Equipo", color: "text-amber-600", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="px-4 py-8 space-y-10 max-w-4xl mx-auto">
      {/* Header */}
      <section>
        <h1 className="text-4xl font-black tracking-tight text-on-surface font-headline leading-tight">
          Hola, {displayName.split(" ")[0]} 👋
        </h1>
        <p className="text-base text-on-surface-variant font-medium mt-1">
          Tu dashboard para este fin de semana.
        </p>
      </section>

      {/* Next service card */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/50">
            Próximo Servicio
          </h2>
          {nextEvent && (
            <Link
              href={`/events/${nextEvent.id}`}
              className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 group"
            >
              Ver detalles
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {nextEvent ? (
          <Card className="p-0 overflow-hidden shadow-card-md border-outline-variant/20 relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
            <div className="relative p-6 space-y-6">
              {/* Title + date */}
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-2xl font-black text-on-surface font-headline leading-tight">
                  {nextEvent.title}
                </h3>
                <div className="flex flex-col items-center justify-center w-16 h-20 rounded-2xl bg-surface-container border border-outline-variant/20 shadow-sm shrink-0">
                  <span className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest">
                    {getMonthAbbr(nextEvent.event_date)}
                  </span>
                  <span className="text-2xl font-black text-on-surface font-headline leading-none mt-1">
                    {getDayNum(nextEvent.event_date)}
                  </span>
                </div>
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap gap-3">
                {nextEvent.start_time && (
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-container border border-outline-variant/10 shadow-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-on-surface">
                      {nextEvent.start_time.slice(0, 5)}
                    </span>
                  </div>
                )}
                {nextEvent.role_type && (
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-primary-container/40 border border-primary/10 shadow-sm">
                    <Guitar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-primary">
                      {ROLE_TYPE_LABELS[nextEvent.role_type] ?? nextEvent.role_type}
                    </span>
                  </div>
                )}
              </div>

              {/* Attendance buttons (only if user is in the team) */}
              {nextEvent.teamId && (
                <DashboardAttendanceButtons
                  eventId={nextEvent.id}
                  eventTeamId={nextEvent.teamId}
                  initialStatus={nextEvent.status as "confirmed" | "pending" | "declined"}
                />
              )}
            </div>
          </Card>
        ) : (
          <div className="rounded-[32px] border-2 border-dashed border-outline-variant/30 p-16 text-center">
            <CalendarDays className="h-10 w-10 text-on-surface-variant/20 mx-auto mb-3" />
            <p className="text-on-surface-variant font-bold text-sm">No hay servicios próximos</p>
          </div>
        )}
      </section>

      {/* Upcoming events list */}
      {(upcomingEvents ?? []).length > 1 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/50">
              Próximos Eventos
            </h2>
            <Link href="/events" className="text-[10px] font-black uppercase tracking-widest text-primary">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {(upcomingEvents ?? []).slice(1).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="group">
                <div className="flex items-center gap-4 rounded-[24px] border border-outline-variant/20 bg-white p-4 shadow-card hover:shadow-card-md hover:border-primary/30 transition-all duration-300">
                  <div className="flex flex-col items-center justify-center w-12 h-14 rounded-xl bg-surface-container border border-outline-variant/10 shrink-0">
                    <span className="text-[8px] font-black text-on-surface-variant/50 uppercase">
                      {getMonthAbbr(event.event_date)}
                    </span>
                    <span className="text-base font-black text-on-surface font-headline leading-none">
                      {getDayNum(event.event_date)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors font-headline">
                      {event.title}
                    </h4>
                    {event.start_time && (
                      <span className="text-xs font-semibold text-on-surface-variant">
                        {event.start_time.slice(0, 5)}
                        {event.location && ` · ${event.location}`}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-on-surface-variant/30 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick access */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/50 px-1">
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <Card className="p-6 flex flex-col items-center text-center gap-3 hover:border-primary/20 transition-all">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {item.label}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
