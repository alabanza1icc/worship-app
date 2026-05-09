"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui";

interface Props {
  eventId: string;
  eventTeamId: string;
  initialStatus: "confirmed" | "pending" | "declined";
}

export function DashboardAttendanceButtons({ eventId, eventTeamId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: "confirmed" | "declined") {
    if (status === newStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/team`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventTeamId, status: newStatus }),
      });
      if (res.ok) setStatus(newStatus);
    } finally {
      setLoading(false);
    }
  }

  if (status === "confirmed") {
    return (
      <div className="flex gap-4 pt-2">
        <div className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
          <Check className="h-5 w-5" />
          Confirmado
        </div>
        <Button
          variant="secondary"
          className="flex-1 rounded-2xl h-14"
          onClick={() => updateStatus("declined")}
          disabled={loading}
        >
          <X className="mr-2 h-5 w-5" />
          Rechazar
        </Button>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="flex gap-4 pt-2">
        <Button
          className="flex-1 rounded-2xl h-14 shadow-primary-glow"
          onClick={() => updateStatus("confirmed")}
          disabled={loading}
        >
          <Check className="mr-2 h-5 w-5" />
          Aceptar
        </Button>
        <div className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm">
          <X className="h-5 w-5" />
          Rechazado
        </div>
      </div>
    );
  }

  // pending
  return (
    <div className="flex gap-4 pt-2">
      <Button
        className="flex-1 rounded-2xl h-14 shadow-primary-glow"
        onClick={() => updateStatus("confirmed")}
        disabled={loading}
      >
        <Check className="mr-2 h-5 w-5" />
        Aceptar
      </Button>
      <Button
        variant="secondary"
        className="flex-1 rounded-2xl h-14"
        onClick={() => updateStatus("declined")}
        disabled={loading}
      >
        <X className="mr-2 h-5 w-5" />
        Rechazar
      </Button>
    </div>
  );
}
