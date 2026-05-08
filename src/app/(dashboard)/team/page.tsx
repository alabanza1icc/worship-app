import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Mail, Users, Edit2 } from "lucide-react";
import { createServiceClient } from "@/lib/supabase";
import { generateInitials } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";

type ProfileRole = "admin" | "musician" | "multimedia" | "participant";

const roleBadge: Record<
  ProfileRole,
  { label: string; variant: "default" | "success" | "warning" | "outline" } | null
> = {
  admin: {
    label: "Admin",
    variant: "default",
  },
  musician: {
    label: "Músico",
    variant: "success",
  },
  multimedia: {
    label: "Multimedia",
    variant: "warning",
  },
  participant: null,
};

function getRoleBadge(role: string) {
  return roleBadge[role as ProfileRole] ?? null;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  instrument: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export default async function TeamPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const isAdmin = currentProfile?.role === "admin";

  const { data: team } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, instrument, avatar_url, is_active")
    .eq("is_active", true)
    .order("role", { ascending: true })
    .order("full_name", { ascending: true });

  const members: Profile[] = team ?? [];

  return (
    <div className="px-4 py-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface font-headline">Equipo</h1>
        {isAdmin && (
          <Button size="sm" className="rounded-2xl opacity-60 cursor-not-allowed" disabled>
            <Users className="h-5 w-5 mr-1" />
            Invitar
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="rounded-[32px] border border-outline-variant/20 bg-white p-12 text-center shadow-card">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-container text-on-surface-variant/40">
            <Users className="h-10 w-10" />
          </div>
          <p className="text-lg font-bold text-on-surface font-headline mb-2">No hay miembros en el equipo</p>
          <p className="text-sm font-medium text-on-surface-variant">
            Los miembros aparecerán aquí una vez que se registren.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {members.map((member) => {
            const badge = getRoleBadge(member.role);
            const initials = generateInitials(member.full_name || member.email);

            return (
              <div
                key={member.id}
                className="group flex items-center gap-5 rounded-[28px] border border-outline-variant/20 bg-white p-5 transition-all duration-300 shadow-card hover:shadow-card-md hover:border-primary/30"
              >
                {/* Avatar */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-primary-glow text-lg font-bold text-white font-headline">
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                    <span className="text-lg font-bold tracking-tight text-on-surface truncate font-headline group-hover:text-primary transition-colors">
                      {member.full_name || member.email}
                    </span>
                    {badge && (
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {member.instrument && (
                      <span className="text-sm font-bold text-primary/80 uppercase tracking-wider">
                        {member.instrument}
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                </div>

                {/* Edit button — admin only */}
                {isAdmin && (
                  <button
                    disabled
                    className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant opacity-40 cursor-not-allowed group-hover:bg-primary-container group-hover:text-primary group-hover:opacity-100 transition-all duration-300"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
