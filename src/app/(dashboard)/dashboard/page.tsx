import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { 
  CalendarDays, 
  Music, 
  Users, 
  Clock, 
  Check, 
  X, 
  ChevronRight,
  Bell,
  Guitar,
  MessageSquare,
  ArrowUpRight
} from "lucide-react";
import { createServiceClient } from "@/lib/supabase";
import { Button, Card, Badge } from "@/components/ui";

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
  title: string;
  message: string;
  time: string;
  icon: any;
  color: string;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const clerkUser = await currentUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, instrument")
    .eq("id", userId)
    .single();

  const displayName = profile?.full_name || clerkUser?.firstName || "Usuario";
  const userRole = profile?.instrument || "Colaborador";

  // Fetch next event for this user
  const { data: assignment } = await supabase
    .from("event_team")
    .select("event_id, role_type, status")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let nextEvent: (Event & { role_type?: string, status?: string }) | null = null;
  
  if (assignment) {
    const { data: eventData } = await supabase
      .from("events")
      .select("id, title, event_type, event_date, start_time, location")
      .eq("id", assignment.event_id)
      .single();
    
    if (eventData) {
      nextEvent = { 
        ...eventData, 
        role_type: assignment.role_type,
        status: assignment.status
      };
    }
  }

  // Fallback to most recent event if no assignment found
  if (!nextEvent) {
    const { data: latestEvent } = await supabase
      .from("events")
      .select("id, title, event_type, event_date, start_time, location")
      .order("event_date", { ascending: true })
      .gte("event_date", new Date().toISOString().split('T')[0])
      .limit(1)
      .single();
    nextEvent = latestEvent;
  }

  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: "Nueva canción añadida al setlist",
      message: "Tumbas a Jardines",
      time: "Hace 2 horas",
      icon: Music,
      color: "bg-primary/10 text-primary"
    },
    {
      id: "2",
      title: "Cambio de tono en 'Glorioso Día'",
      message: "De E a Eb",
      time: "Ayer",
      icon: MessageSquare,
      color: "bg-secondary/10 text-secondary"
    }
  ];

  const getMonthAbbr = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", { month: "short" }).toUpperCase().replace(".", "");
  };

  const getDayNum = (dateStr: string) => {
    return dateStr.split("-")[2];
  };

  return (
    <div className="px-6 py-10 space-y-12 max-w-4xl mx-auto min-h-screen">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-5xl font-black tracking-tight text-on-surface font-headline leading-tight">
          Hola, {displayName.split(' ')[0]}
        </h1>
        <p className="text-lg text-on-surface-variant font-medium">
          Tu dashboard para este fin de semana.
        </p>
      </section>

      {/* Hero Event Card */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/40">
            Próximo Servicio
          </h2>
          {nextEvent && (
            <Link href={`/events/${nextEvent.id}`} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 group">
              Detalles
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {nextEvent ? (
          <Card className="p-0 overflow-hidden border-outline-variant/30 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                   <h3 className="text-4xl font-black text-on-surface font-headline leading-tight">
                    {nextEvent.title}
                  </h3>
                </div>
                <div className="flex flex-col items-center justify-center w-20 h-24 rounded-3xl bg-surface-container border border-outline-variant/20 shadow-sm shrink-0">
                  <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">
                    {getMonthAbbr(nextEvent.event_date)}
                  </span>
                  <span className="text-3xl font-black text-on-surface font-headline">
                    {getDayNum(nextEvent.event_date)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/10">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-on-surface-variant/60 uppercase tracking-widest">Horario</span>
                    <span className="text-sm font-bold text-on-surface">
                      {nextEvent.start_time ? nextEvent.start_time.slice(0, 5) : "10:00"} AM - 12:00 PM
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/10">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                    <Guitar className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-on-surface-variant/60 uppercase tracking-widest">Tu Función</span>
                    <span className="text-sm font-bold text-on-surface">
                      {nextEvent.role_type || userRole}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button className="flex-1 rounded-2xl h-14 shadow-primary-glow">
                  <Check className="mr-2 h-5 w-5" />
                  Aceptar
                </Button>
                <Button variant="secondary" className="flex-1 rounded-2xl h-14">
                  <X className="mr-2 h-5 w-5" />
                  Rechazar
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="rounded-[40px] border-2 border-dashed border-outline-variant/30 p-20 text-center bg-surface-container/20">
             <CalendarDays className="h-12 w-12 text-on-surface-variant/20 mx-auto mb-4" />
             <p className="text-on-surface-variant font-bold">No tienes servicios programados</p>
          </div>
        )}
      </section>

      {/* Notifications */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/40">
            Notificaciones
          </h2>
          <button className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors">
            Ver todas
          </button>
        </div>

        <div className="space-y-3">
          {mockNotifications.map((notif) => (
            <Card key={notif.id} className="p-5 flex items-center gap-5 hover:border-primary/20 hover:bg-white transition-all cursor-pointer group">
              <div className={`w-12 h-12 rounded-2xl ${notif.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <notif.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-on-surface-variant leading-tight mb-0.5">
                  {notif.title}
                </h4>
                <p className="text-base font-black text-on-surface truncate font-headline">
                  {notif.message}
                </p>
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1 block">
                  {notif.time}
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-on-surface-variant/20 group-hover:text-primary transition-colors" />
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Access */}
      <section className="grid grid-cols-2 gap-4">
         <Link href="/songs" className="group">
           <Card className="p-6 flex flex-col items-center text-center gap-3 hover:border-secondary/20 hover:bg-secondary/5 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Music className="h-6 w-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Canciones</span>
           </Card>
         </Link>
         <Link href="/team" className="group">
           <Card className="p-6 flex flex-col items-center text-center gap-3 hover:border-amber-500/20 hover:bg-amber-500/5 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Equipo</span>
           </Card>
         </Link>
      </section>
    </div>
  );
}
