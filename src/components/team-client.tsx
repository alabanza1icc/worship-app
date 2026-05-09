"use client";

import { useState } from "react";
import { Mail, Edit2, Users, Music, Monitor, Footprints, Plus, Check, Mic, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button, Badge, Modal, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { generateInitials } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type MinistryRole = "worship" | "audiovisual" | "dance";
type ProfileRole = "admin" | "leader" | "participant" | "musician" | "multimedia";

interface Member {
  id: string;
  full_name: string;
  email: string;
  role: ProfileRole;
  roles: MinistryRole[];
  instrument: string | null;
  instruments: string[];
  can_sing: boolean;
  is_leader: boolean;
  is_active: boolean;
  phone: string | null;
  avatar_url: string | null;
}

interface Props {
  members: Member[];
  isAdmin: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MINISTRY_SECTIONS: {
  key: MinistryRole | "none";
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    key: "worship",
    label: "Alabanza",
    icon: Music,
    color: "text-primary",
    bg: "bg-primary-container/40",
    border: "border-primary/20",
  },
  {
    key: "audiovisual",
    label: "Multimedia",
    icon: Monitor,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    key: "dance",
    label: "Danza",
    icon: Footprints,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    key: "none",
    label: "Sin Ministerio",
    icon: Users,
    color: "text-on-surface-variant",
    bg: "bg-surface-container",
    border: "border-outline-variant/30",
  },
];

const ROLE_OPTIONS: { value: ProfileRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "leader", label: "Líder" },
  { value: "musician", label: "Músico" },
  { value: "multimedia", label: "Multimedia" },
  { value: "participant", label: "Participante" },
];

const ROLE_LABELS: Record<ProfileRole, string> = {
  admin: "Admin",
  leader: "Líder",
  musician: "Músico",
  multimedia: "Multimedia",
  participant: "Participante",
};

const ROLE_BADGE_VARIANT: Record<ProfileRole, "default" | "success" | "warning" | "outline" | "danger"> = {
  admin: "default",
  leader: "success",
  musician: "warning",
  multimedia: "outline",
  participant: "outline",
};

const INSTRUMENT_SUGGESTIONS = [
  "Guitarra", "Piano", "Bajo", "Batería", "Teclados",
  "Violín", "Saxofón", "Trompeta", "Flauta", "Percusión",
  "Voz", "Coro", "Proyección", "Cámara", "Sonido",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMembersForMinistry(members: Member[], ministry: MinistryRole | "none"): Member[] {
  if (ministry === "none") {
    return members.filter((m) => !m.roles || m.roles.length === 0);
  }
  return members.filter((m) => m.roles?.includes(ministry));
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function EditMemberModal({
  member,
  open,
  onClose,
  onSave,
}: {
  member: Member;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Member) => void;
}) {
  const [form, setForm] = useState({
    full_name: member.full_name,
    phone: member.phone ?? "",
    role: member.role,
    roles: member.roles ?? [],
    instrument: member.instrument ?? "",
    instruments: (member.instruments ?? []).join(", "),
    can_sing: member.can_sing,
    is_leader: member.is_leader,
    is_active: member.is_active,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleMinistry(ministry: MinistryRole) {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(ministry)
        ? prev.roles.filter((r) => r !== ministry)
        : [...prev.roles, ministry],
    }));
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const instrumentsArray = form.instruments
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/team/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone || null,
          role: form.role,
          roles: form.roles,
          instrument: form.instrument || null,
          instruments: instrumentsArray,
          can_sing: form.can_sing,
          is_leader: form.is_leader,
          is_active: form.is_active,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Error al guardar");
        return;
      }
      const updated = await res.json();
      onSave(updated as Member);
      onClose();
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Editar: ${member.full_name}`}>
      <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
        <Input
          label="Nombre completo"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <Input
          label="Teléfono"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+57 300 000 0000"
        />
        <Select
          label="Rol en la app"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as ProfileRole })}
          options={ROLE_OPTIONS}
        />

        {/* Ministry checkboxes */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-on-surface-variant ml-1 font-headline tracking-tight">
            Ministerios
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["worship", "audiovisual", "dance"] as MinistryRole[]).map((m) => {
              const active = form.roles.includes(m);
              const labels: Record<MinistryRole, string> = { worship: "Alabanza", audiovisual: "Multimedia", dance: "Danza" };
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMinistry(m)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold border transition-all",
                    active
                      ? "bg-primary-container/40 border-primary/30 text-primary"
                      : "bg-surface-container border-outline-variant/20 text-on-surface-variant hover:border-primary/20"
                  )}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                  {labels[m]}
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Instrumento principal"
          value={form.instrument}
          onChange={(e) => setForm({ ...form, instrument: e.target.value })}
          placeholder="Ej: Guitarra"
        />
        <Input
          label="Instrumentos adicionales (coma)"
          value={form.instruments}
          onChange={(e) => setForm({ ...form, instruments: e.target.value })}
          placeholder="Piano, Bajo, Teclados"
        />

        {/* Toggles */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setForm({ ...form, can_sing: !form.can_sing })}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border transition-all",
              form.can_sing
                ? "bg-primary-container/40 border-primary/30 text-primary"
                : "bg-surface-container border-outline-variant/20 text-on-surface-variant"
            )}
          >
            <Mic className="h-3.5 w-3.5" />
            {form.can_sing ? "Canta ✓" : "No canta"}
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, is_leader: !form.is_leader })}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border transition-all",
              form.is_leader
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-surface-container border-outline-variant/20 text-on-surface-variant"
            )}
          >
            {form.is_leader ? "Líder ✓" : "No líder"}
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, is_active: !form.is_active })}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold border transition-all",
              form.is_active
                ? "bg-surface-container border-outline-variant/20 text-on-surface-variant"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            )}
          >
            {form.is_active ? "Activo" : "Inactivo"}
          </button>
        </div>

        {error && <p className="text-xs font-bold text-destructive ml-1">{error}</p>}

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="ghost" className="flex-1 rounded-xl" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1 rounded-xl" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Member Card ─────────────────────────────────────────────────────────────

function MemberCard({
  member,
  isAdmin,
  onEdit,
}: {
  member: Member;
  isAdmin: boolean;
  onEdit: (m: Member) => void;
}) {
  const initials = generateInitials(member.full_name || member.email);
  const badge = ROLE_BADGE_VARIANT[member.role];
  const allInstruments = [
    ...(member.instrument ? [member.instrument] : []),
    ...(member.instruments ?? []).filter((i) => i !== member.instrument),
  ];

  return (
    <div className="group flex items-center gap-4 rounded-[28px] border border-outline-variant/20 bg-white p-4 transition-all duration-300 shadow-card hover:shadow-card-md hover:border-primary/30">
      {/* Avatar */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-primary-glow text-base font-bold text-white font-headline">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="text-base font-bold tracking-tight text-on-surface font-headline group-hover:text-primary transition-colors truncate">
            {member.full_name || member.email}
          </span>
          <Badge variant={badge} className="rounded-lg text-[10px] shrink-0">
            {ROLE_LABELS[member.role]}
          </Badge>
          {member.is_leader && (
            <Badge variant="success" className="rounded-lg text-[10px] shrink-0">Líder</Badge>
          )}
        </div>

        {/* Instruments / skills */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
          {allInstruments.length > 0 && (
            <span className="text-xs font-bold text-primary/80 uppercase tracking-wider">
              {allInstruments.join(" · ")}
            </span>
          )}
          {member.can_sing && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider">
              <Mic className="h-3 w-3" /> Voz
            </span>
          )}
          <span className="text-xs font-medium text-on-surface-variant/60 truncate hidden sm:block">
            {member.email}
          </span>
        </div>
      </div>

      {/* Edit */}
      {isAdmin && (
        <button
          onClick={() => onEdit(member)}
          className="w-9 h-9 shrink-0 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary-container hover:text-primary opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ─── Ministry Section ─────────────────────────────────────────────────────────

function MinistrySection({
  section,
  members,
  isAdmin,
  onEdit,
}: {
  section: typeof MINISTRY_SECTIONS[0];
  members: Member[];
  isAdmin: boolean;
  onEdit: (m: Member) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const Icon = section.icon;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-1 group"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center", section.bg, section.border, "border")}>
            <Icon className={cn("h-4 w-4", section.color)} />
          </div>
          <span className="text-base font-bold text-on-surface font-headline">{section.label}</span>
          <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
            ({members.length})
          </span>
        </div>
        {collapsed
          ? <ChevronDown className="h-4 w-4 text-on-surface-variant/40" />
          : <ChevronUp className="h-4 w-4 text-on-surface-variant/40" />
        }
      </button>

      {/* Members */}
      {!collapsed && (
        members.length === 0 ? (
          <div className="ml-12 rounded-2xl border border-dashed border-outline-variant/30 py-8 text-center">
            <p className="text-sm font-medium text-on-surface-variant/50">
              Ningún miembro en este ministerio
            </p>
          </div>
        ) : (
          <div className="ml-0 grid grid-cols-1 gap-3">
            {members.map((m) => (
              <MemberCard key={m.id} member={m} isAdmin={isAdmin} onEdit={onEdit} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/notifications/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Error al enviar la invitación");
        return;
      }
      setSuccess(true);
      setEmail("");
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSuccess(false);
    setError("");
    setEmail("");
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Invitar al equipo">
      {success ? (
        <div className="text-center space-y-4 py-4">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Check className="h-8 w-8" />
          </div>
          <p className="font-bold text-on-surface">¡Invitación enviada!</p>
          <p className="text-sm text-on-surface-variant">
            Le enviamos un email con el enlace para registrarse.
          </p>
          <Button onClick={handleClose} className="w-full rounded-xl">Cerrar</Button>
        </div>
      ) : (
        <form onSubmit={handleInvite} className="space-y-5">
          <p className="text-sm text-on-surface-variant">
            Le enviaremos un email con instrucciones para unirse a WorshipApp. Una vez que se registre con Clerk, aparecerá en la lista del equipo.
          </p>
          <Input
            label="Email del invitado"
            type="email"
            placeholder="colaborador@iglesia.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-xs font-bold text-destructive ml-1">{error}</p>}
          <div className="flex gap-4 pt-2">
            <Button type="button" variant="ghost" className="flex-1 rounded-xl" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>
              {loading ? "Enviando..." : "Enviar invitación"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function TeamClient({ members: initialMembers, isAdmin }: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? members.filter((m) =>
        m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.instrument?.toLowerCase().includes(search.toLowerCase())
      )
    : members;

  function handleSave(updated: Member) {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  return (
    <div className="px-4 py-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface font-headline">Equipo</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            {members.length} miembro{members.length !== 1 ? "s" : ""} registrado{members.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowInvite(true)} className="rounded-2xl">
            <Plus className="h-4 w-4 mr-1.5" />
            Invitar
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
        <input
          type="search"
          placeholder="Buscar miembro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[24px] border border-outline-variant/30 bg-white py-3.5 pl-11 pr-6 text-sm text-on-surface shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 font-medium"
        />
      </div>

      {/* Ministry sections */}
      <div className="space-y-10">
        {MINISTRY_SECTIONS.map((section) => {
          const sectionMembers = getMembersForMinistry(filtered, section.key);
          // Hide "Sin ministerio" if empty
          if (section.key === "none" && sectionMembers.length === 0) return null;
          return (
            <MinistrySection
              key={section.key}
              section={section}
              members={sectionMembers}
              isAdmin={isAdmin}
              onEdit={setEditingMember}
            />
          );
        })}
      </div>

      {/* Edit modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          open={!!editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleSave}
        />
      )}

      {/* Invite modal */}
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} />
    </div>
  );
}
