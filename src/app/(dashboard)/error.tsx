"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service if needed
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-black text-on-surface font-headline mb-2">
        Algo salió mal
      </h2>
      <p className="text-on-surface-variant font-medium mb-8 max-w-sm">
        Ocurrió un error al cargar esta página. Por favor intenta de nuevo.
      </p>
      {error.digest && (
        <p className="text-[10px] font-mono text-on-surface-variant/40 mb-6">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-outline-variant/20 bg-surface-container text-on-surface text-sm font-black uppercase tracking-widest hover:border-primary/30 transition-colors"
        >
          <Home className="h-4 w-4" />
          Inicio
        </Link>
      </div>
    </div>
  );
}
