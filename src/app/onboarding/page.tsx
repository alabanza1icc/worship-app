"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music, Mic, Video, Heart } from "lucide-react";

const INSTRUMENTS = [
  "Guitarra", "Bajo", "Batería", "Piano", "Teclados",
  "Violín", "Trompeta", "Saxofón", "Flauta", "Otro",
];

const MINISTRIES = [
  { value: "worship", label: "Alabanza", icon: Music, description: "Músicos y cantantes del equipo de alabanza" },
  { value: "audiovisual", label: "Audiovisual", icon: Video, description: "Pantallas, sonido, streaming y multimedia" },
  { value: "dance", label: "Danza", icon: Heart, description: "Equipo de danza y expresión corporal" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [canSing, setCanSing] = useState(false);

  const toggleMinistry = (value: string) => {
    setSelectedMinistries((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    );
  };

  const toggleInstrument = (inst: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]
    );
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError("Por favor ingresa tu nombre.");
      return;
    }
    if (selectedMinistries.length === 0) {
      setError("Selecciona al menos un ministerio.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          roles: selectedMinistries,
          instruments: selectedInstruments,
          can_sing: canSing,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al guardar. Intenta de nuevo.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-950 placeholder-slate-400 transition-all duration-200 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(99,102,241,0.14) 0%, transparent 60%), hsl(var(--background))",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            WorshipApp
          </h1>
          <p className="mt-1 text-sm text-slate-500">Configura tu perfil para comenzar</p>
        </div>

        {/* Progress */}
        <div className="mb-6 flex gap-1.5">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? "bg-indigo-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Personal info */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Información personal
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                ¿Cómo se llama y cómo contactarte?
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-600">
                Nombre completo *
              </label>
              <input
                type="text"
                placeholder="Ej: Juan García"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-600">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                placeholder="+57 300 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
              onClick={() => {
                if (!fullName.trim()) { setError("El nombre es requerido."); return; }
                setError("");
                setStep(2);
              }}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:opacity-90 active:scale-[0.98] cursor-pointer"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Ministry & Instruments */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Tu ministerio
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                ¿En qué área del ministerio participas?
              </p>
            </div>

            {/* Ministry selection */}
            <div className="space-y-2">
              {MINISTRIES.map((m) => {
                const selected = selectedMinistries.includes(m.value);
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => toggleMinistry(m.value)}
                    className={`w-full rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                      selected
                        ? "border-indigo-500/40 bg-indigo-500/10"
                        : "border-slate-200 bg-white/70 hover:bg-indigo-50/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${selected ? "bg-indigo-500/20" : "bg-white/80"}`}>
                        <m.icon className={`h-4 w-4 ${selected ? "text-indigo-600" : "text-slate-500"}`} />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${selected ? "text-indigo-700" : "text-slate-700"}`}>
                          {m.label}
                        </div>
                        <div className="text-xs text-slate-400">{m.description}</div>
                      </div>
                      <div className={`ml-auto h-4 w-4 rounded-full border-2 transition-all ${selected ? "border-indigo-500 bg-indigo-500" : "border-white/20"}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instruments (only if worship ministry selected) */}
            {selectedMinistries.includes("worship") && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600">
                  Instrumentos que tocas
                </label>
                <div className="flex flex-wrap gap-2">
                  {INSTRUMENTS.map((inst) => {
                    const selected = selectedInstruments.includes(inst);
                    return (
                      <button
                        key={inst}
                        type="button"
                        onClick={() => toggleInstrument(inst)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                          selected
                            ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-700"
                            : "border-slate-200 bg-white/70 text-slate-500 hover:bg-white/90"
                        }`}
                      >
                        {inst}
                      </button>
                    );
                  })}
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-3 transition-colors hover:bg-white/80">
                  <div className={`h-5 w-5 rounded border-2 transition-all flex items-center justify-center ${canSing ? "border-indigo-500 bg-indigo-500" : "border-white/20"}`}>
                    {canSing && (
                      <svg className="h-3 w-3 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input type="checkbox" className="sr-only" checked={canSing} onChange={(e) => setCanSing(e.target.checked)} />
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">También canto o hago coros</span>
                  </div>
                </label>
              </div>
            )}

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setError(""); setStep(1); }}
                className="flex-1 rounded-xl border border-slate-200 bg-white/70 py-3 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-indigo-50/70 cursor-pointer"
              >
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Guardando..." : "Comenzar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
