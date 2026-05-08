"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type EventType =
  | "servicio_dominical"
  | "ensayo"
  | "evento_especial"
  | "servicio_jovenes"
  | "otro";

const eventTypeIcons: Record<EventType, string> = {
  servicio_dominical: "📖",
  ensayo: "🎸",
  evento_especial: "🎉",
  servicio_jovenes: "🎵",
  otro: "📅",
};

function getEventIcon(eventType: string): string {
  return eventTypeIcons[eventType as EventType] ?? "📅";
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface Event {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":");
  return `${h}:${m}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data: Event[] = await res.json();
          setEvents(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const eventsInMonth = events.filter((e) => {
    const [y, m] = e.event_date.split("-").map(Number);
    return y === currentYear && m - 1 === currentMonth;
  });

  const daysWithEvents = new Set(
    eventsInMonth.map((e) => Number(e.event_date.split("-")[2]))
  );

  const eventsForSelectedDay =
    selectedDay !== null
      ? eventsInMonth.filter(
          (e) => Number(e.event_date.split("-")[2]) === selectedDay
        )
      : [];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstWeekday = getFirstWeekday(currentYear, currentMonth);
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  function goToPrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  }

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  return (
    <div className="px-4 py-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface font-headline">Calendario</h1>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white rounded-3xl border border-outline-variant/20 p-2 shadow-card">
        <button
          onClick={goToPrevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-2xl text-on-surface-variant hover:bg-surface-container transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-lg font-bold text-on-surface font-headline">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          onClick={goToNextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-2xl text-on-surface-variant hover:bg-surface-container transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-[32px] border border-outline-variant/20 bg-white p-6 shadow-card">
        {/* Weekday Headers */}
        <div className="mb-4 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
              {d}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: totalCells }, (_, i) => {
            const day = i - firstWeekday + 1;
            const isValidDay = day >= 1 && day <= daysInMonth;
            const hasEvent = isValidDay && daysWithEvents.has(day);
            const isSelected = isValidDay && selectedDay === day;
            const isTodayDay = isValidDay && isToday(day);

            if (!isValidDay) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all duration-300 group",
                  isSelected
                    ? "bg-primary text-white shadow-primary-glow"
                    : hasEvent
                      ? "bg-primary-container/40 text-primary hover:bg-primary-container/60"
                      : isTodayDay
                        ? "border-2 border-primary/40 text-on-surface hover:bg-surface-container"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <span>{day}</span>
                {hasEvent && !isSelected && (
                  <span className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
                {isTodayDay && !isSelected && (
                  <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events for selected day */}
      <section>
        {loading ? (
          <div className="rounded-[32px] border border-outline-variant/20 bg-white p-12 text-center shadow-card">
            <p className="text-sm font-bold text-on-surface-variant animate-pulse">Cargando eventos...</p>
          </div>
        ) : selectedDay !== null ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface font-headline">
                {eventsForSelectedDay.length > 0
                  ? `Eventos del ${selectedDay} de ${MONTH_NAMES[currentMonth]}`
                  : `Sin eventos el ${selectedDay} de ${MONTH_NAMES[currentMonth]}`}
              </h3>
            </div>
            
            {eventsForSelectedDay.length === 0 ? (
              <div className="rounded-[32px] border border-outline-variant/20 bg-white p-12 text-center shadow-card">
                <CalendarDays className="mx-auto mb-4 h-10 w-10 text-on-surface-variant/20" />
                <p className="text-sm font-semibold text-on-surface-variant">No hay eventos para este día</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {eventsForSelectedDay.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group flex items-center gap-5 rounded-[28px] border border-outline-variant/20 bg-white p-5 transition-all duration-300 shadow-card hover:shadow-card-md hover:border-primary/30"
                  >
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-surface-container flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                      {getEventIcon(event.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-lg font-bold text-on-surface font-headline group-hover:text-primary transition-colors">
                        {event.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5">
                        {event.start_time && (
                          <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            {formatTime(event.start_time)}
                            {event.end_time && ` – ${formatTime(event.end_time)}`}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-primary transition-all duration-300">
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[32px] border border-outline-variant/20 bg-white p-12 text-center shadow-card">
            <p className="text-sm font-bold text-on-surface-variant">
              Selecciona un día para ver sus eventos
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
