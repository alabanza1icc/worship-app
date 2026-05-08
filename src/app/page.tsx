import Link from "next/link";
import { CalendarDays, Music, Users, Radio } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      {/* Hero Section */}
      <div className="flex min-h-screen flex-col">
        <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur px-4">
          <span className="text-xl font-bold text-indigo-600">WorshipApp</span>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-slate-500 hover:text-slate-950"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Registrarse
            </Link>
          </div>
        </header>

        {/* Main Hero */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 pt-14">
          <div className="max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-500">
              <Radio className="h-4 w-4 text-[hsl(0,100%,50%)]" />
              Modo En Vivo incluido
            </div>
            <h1 className="mb-4 text-4xl font-bold leading-tight">
              Gestión integral para tu equipo de alabanza
            </h1>
            <p className="mb-8 text-lg text-slate-500">
              Planifica servicios, gestiona repertorio, asigna roles y presenta
              letras en vivo. Todo en una sola plataforma.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/sign-up"
                className="rounded-xl bg-indigo-600 px-8 py-4 text-lg font-medium text-white hover:opacity-90"
              >
                Comenzar gratis
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-200 bg-white/80 px-8 py-4 text-lg font-medium text-slate-950 hover:border-indigo-500"
              >
                Ver demo
              </Link>
            </div>
          </div>
        </main>

        {/* Features Grid */}
        <section className="border-t border-slate-200 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-2xl font-bold">
              Todo lo que necesitas
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600/10">
                  <CalendarDays className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 font-semibold">Eventos</h3>
                <p className="text-sm text-slate-500">
                  Planifica servicios, ensayos y eventos especiales con setlist incluido.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/80 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600/10">
                  <Music className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 font-semibold">Repertorio</h3>
                <p className="text-sm text-slate-500">
                  Guarda canciones con cifrados, transporta tonos y reproduce multitracks.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/80 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600/10">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 font-semibold">Equipo</h3>
                <p className="text-sm text-slate-500">
                  Asigna roles, confirma asistencia y comunica cambios en tiempo real.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/80 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                  <Radio className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="mb-2 font-semibold">Modo En Vivo</h3>
                <p className="text-sm text-slate-500">
                  Presentación fullscreen con transposición y pantalla siempre encendida.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
          <p>WorshipApp © 2026</p>
        </footer>
      </div>
    </div>
  );
}
