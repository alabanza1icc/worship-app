"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CalendarDays, Music, Users, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NOTIF_CONFIG: Record<string, { icon: any; color: string }> = {
  event_invite: { icon: CalendarDays, color: "bg-primary/10 text-primary" },
  song_update: { icon: Music, color: "bg-blue-500/10 text-blue-600" },
  team_change: { icon: Users, color: "bg-amber-500/10 text-amber-600" },
  schedule_change: { icon: Clock, color: "bg-destructive/10 text-destructive" },
};

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications");
        if (active && res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to load notifications", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadNotifications();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300",
          open 
            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
            : "bg-surface-container text-on-surface-variant hover:bg-white hover:text-primary hover:shadow-md border border-outline-variant/10"
        )}
        aria-label="Notificaciones"
      >
        <Bell className={cn("h-5 w-5", open ? "animate-pulse" : "")} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-black text-white border-2 border-white shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 z-50 w-[340px] overflow-hidden rounded-[32px] border border-outline-variant/20 bg-white/95 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between border-b border-outline-variant/10 px-6 py-5 bg-surface-container/30">
            <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
              >
                <Check className="h-3 w-3" />
                Marcar todo leído
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-20 px-8 text-center space-y-3">
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Bell className="h-8 w-8 text-on-surface-variant/40" />
                </div>
                <p className="text-sm font-black text-on-surface uppercase tracking-widest leading-tight">
                  Estás al día
                </p>
                <p className="text-xs font-bold text-on-surface-variant/50">
                  No tienes notificaciones nuevas por ahora.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {notifications.map((n) => {
                  const config = NOTIF_CONFIG[n.type] || { icon: Bell, color: "bg-surface-container text-on-surface-variant" };
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "px-6 py-5 transition-all duration-300 hover:bg-surface-container/30",
                        !n.is_read ? "bg-primary/[0.03]" : ""
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                          config.color
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-black text-on-surface uppercase tracking-tight truncate leading-tight">
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary shadow-sm shadow-primary/30" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-widest mt-2 block">
                            {formatDistanceToNow(new Date(n.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-outline-variant/10 bg-surface-container/10">
            <button className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary hover:bg-white transition-all">
              Ver todo el historial
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
