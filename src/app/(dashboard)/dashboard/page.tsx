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
  Bell,
  MessageSquare,
} from "lucide-react";
import { createServiceClient } from "@/lib/supabase";
import { Card, Badge } from "@/components/ui";
import { DashboardAttendanceButtons } from "@/components/dashboard-attendance-buttons";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  start_time: string | null;
  location: string | null;
}

interface Notification {
  id: string;
  type: "event_invite" | "song_update" | "team_change" | "schedule_change";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
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

const NOTIFICATION_CONFIG = {
  event_invite: { icon: CalendarDays, color: "bg-primary/10 text-primary" },
  song_update: { icon: Music, color: "bg-blue-500/10 text-blue-600" },
  team_change: { icon: Users, color: "bg-amber-500/10 text-amber-600" },
  schedule_change: { icon: Clock, color: "bg-destructive/10 text-destructive" },
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

  // Fetch next upcoming event this user is assigned to
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

  // Fetch real notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch next 4 upcoming events (1 for hero, 3 for slider)
  const { data: upcomingEventsData } = await supabase
    .from("events")
    .select("id, title, event_type, event_date, start_time, location")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(4);

  const upcomingEvents = upcomingEventsData ?? [];
  const heroEvent = nextEvent || (upcomingEvents.length > 0 ? { ...upcomingEvents[0], role_type: "", status: "pending", teamId: "" } : null);
  const sliderEvents = nextEvent 
    ? upcomingEvents.filter(e => e.id !== nextEvent.id).slice(0, 3)
    : upcomingEvents.slice(1, 4);

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
    <div className="px-4 py-8 space-y-12 max-w-4xl mx-auto pb-32">
      {/* Header */}
      <section>
        <h1 className="text-5xl font-black tracking-tight text-on-surface font-headline leading-tight">
          Hola, {displayName.split(" ")[0]}
        </h1>
        <p className="text-lg text-on-surface-variant font-medium mt-1">
          Tu dashboard para este fin de semana.
        </p>
      </section>

      {/* Next service hero */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/50">
            Próximo Servicio
          </h2>
          {heroEvent && (
            <Link
              href={`/events/${heroEvent.id}`}
              className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 group"
            >
              Ver detalles
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {heroEvent ? (
          <Link href={`/events/${heroEvent.id}`} className="block group">
            <Card className="p-0 overflow-hidden shadow-2xl border-outline-variant/20 relative group-hover:border-primary/30 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/10 transition-all" />
              <div className="relative p-8 space-y-8">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-3xl lg:text-4xl font-black text-on-surface font-headline leading-tight group-hover:text-primary transition-colors">
                    {heroEvent.title}
                  </h3>
                  <div className="flex flex-col items-center justify-center w-20 h-24 rounded-3xl bg-surface-container border border-outline-variant/20 shadow-sm shrink-0">
                    <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">
                      {getMonthAbbr(heroEvent.event_date)}
                    </span>
                    <span className="text-3xl font-black text-on-surface font-headline leading-none mt-1">
                      {getDayNum(heroEvent.event_date)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {heroEvent.start_time && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/10 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest">Horario</span>
                        <span className="text-sm font-bold text-on-surface">
                          {heroEvent.start_time.slice(0, 5)} AM - 12:00 PM
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/10 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                      <Guitar className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest">Tu Función</span>
                      <span className="text-sm font-bold text-on-surface">
                        {heroEvent.role_type ? ROLE_TYPE_LABELS[heroEvent.role_type] ?? heroEvent.role_type : "Por asignar"}
                      </span>
                    </div>
                  </div>
                </div>

                {heroEvent.teamId && (
                  <div onClick={(e) => e.preventDefault()}>
                    <DashboardAttendanceButtons
                      eventId={heroEvent.id}
                      eventTeamId={heroEvent.teamId}
                      initialStatus={heroEvent.status as "confirmed" | "pending" | "declined"}
                    />
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ) : (
          <div className="rounded-[40px] border-2 border-dashed border-outline-variant/30 p-16 text-center bg-surface-container/20">
            <CalendarDays className="h-10 w-10 text-on-surface-variant/20 mx-auto mb-3" />
            <p className="text-on-surface-variant font-bold">No hay servicios programados</p>
          </div>
        )}
      </section>

      {/* Upcoming events slider */}
      {sliderEvents.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/50">
              Próximos Eventos
            </h2>
            <Link href="/events" className="text-[10px] font-black uppercase tracking-widest text-primary">
              Ver todos
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {sliderEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="shrink-0 w-[280px] group">
                <Card className="p-5 space-y-4 hover:border-primary/20 transition-all shadow-md bg-white/50 border-outline-variant/10">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[7px] font-black text-on-surface-variant/50 uppercase leading-none">
                        {getMonthAbbr(event.event_date)}
                      </span>
                      <span className="text-sm font-black text-on-surface leading-none mt-1">
                        {getDayNum(event.event_date)}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[8px] uppercase tracking-tighter">
                      {event.event_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors font-headline">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/60">
                      <Clock className="h-3 w-3" />
                      {event.start_time?.slice(0, 5)} AM
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Notifications list */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/50">
            Notificaciones
          </h2>
          <button className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors">
            Ver todas
          </button>
        </div>

        <div className="space-y-3">
          {(notifications ?? []).length === 0 ? (
            <p className="text-sm font-bold text-on-surface-variant/40 px-4 py-8 text-center italic">
              No tienes notificaciones nuevas
            </p>
          ) : (
            notifications!.map((notif: any) => {
              const config = NOTIFICATION_CONFIG[notif.type as keyof typeof NOTIFICATION_CONFIG] || {
                icon: Bell,
                color: "bg-surface-container text-on-surface-variant",
              };
              const Icon = config.icon;
              
              return (
                <Card
                  key={notif.id}
                  className="p-5 flex items-center gap-5 hover:border-primary/20 hover:bg-white transition-all cursor-pointer group border-outline-variant/10 shadow-sm"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl ${config.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-tight mb-1">
                      {notif.title}
                    </h4>
                    <p className="text-base font-black text-on-surface truncate font-headline leading-tight">
                      {notif.message}
                    </p>
                    <span className="text-[10px] font-bold text-on-surface-variant/30 uppercase tracking-widest mt-1.5 block">
                      {formatDistanceToNow(new Date(notif.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-on-surface-variant/20 group-hover:text-primary transition-colors" />
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Quick access */}
      <section className="grid grid-cols-2 gap-4">
        {quickLinks.map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <Card className="p-8 flex flex-col items-center text-center gap-4 hover:border-primary/20 transition-all shadow-md">
              <div
                className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}
              >
                <item.icon className="h-7 w-7" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">
                {item.label}
              </span>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
