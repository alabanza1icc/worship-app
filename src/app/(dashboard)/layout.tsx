"use client";

import { Calendar, Music, Users, CalendarDays, Home, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { NotificationsBell } from "@/components/notifications-bell";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/events", icon: CalendarDays, label: "Events" },
  { href: "/songs", icon: Music, label: "Library" },
  { href: "/team", icon: Users, label: "Team" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      {/* Ambient background effect */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-20 items-center justify-between border-b border-outline-variant/10 bg-white/60 px-6 backdrop-blur-2xl">
        <button className="p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant">
          <Menu className="h-6 w-6" />
        </button>

        <Link
          href="/dashboard"
          className="text-xl font-black tracking-tight text-on-surface font-headline"
        >
          Worship<span className="text-primary">App</span>
        </Link>

        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10 rounded-2xl shadow-md border-2 border-white",
              },
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 pb-24 pt-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant/10 bg-white/80 shadow-[0_-8px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl px-2">
        <div className="flex justify-around items-center max-w-lg mx-auto h-[80px]">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl transition-all duration-300 relative group",
                  isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl -z-10 animate-in fade-in zoom-in duration-300" />
                )}
                <item.icon
                  className={cn(
                    "h-6 w-6 transition-transform duration-300 group-active:scale-90",
                    isActive && "fill-primary/10"
                  )}
                />
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                  isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
