"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, RotateCcw, Plus, Minus, Music } from "lucide-react";
import { transposeLyricsWithChords } from "@/lib/chart-pro";
import { cn } from "@/lib/utils";

interface Part {
  name: string;
  content: string;
}

interface SetlistItem {
  id: string;
  title: string;
  artist: string;
  custom_key: string | null;
  original_key: string | null;
  parts: Part[];
}

interface LiveModeClientProps {
  eventId: string;
  eventTitle?: string;
  initialSetlist?: SetlistItem[];
}

export default function LiveModeClient({
  eventId,
  eventTitle = "Servicio",
  initialSetlist = [],
}: LiveModeClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transposition, setTransposition] = useState(0);

  const setlist = initialSetlist;

  const exitLiveMode = () => {
    router.back();
  };

  const nextItem = useCallback(() => {
    if (currentIndex < setlist.length - 1) {
      setCurrentIndex((i) => i + 1);
      setTransposition(0); // Reset transposition for next song
    }
  }, [currentIndex, setlist.length]);

  const prevItem = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setTransposition(0); // Reset transposition for previous song
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextItem();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevItem();
      } else if (e.key === "Escape") {
        exitLiveMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextItem, prevItem]);

  const currentItem = setlist[currentIndex];
  const totalItems = setlist.length;

  const getDisplayKey = () => {
    if (!currentItem) return "Do";
    return currentItem.custom_key || currentItem.original_key || "Do";
  };

  const renderPartContent = (content: string) => {
    const transposed = transposeLyricsWithChords(content, transposition);
    return transposed.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      
      // Check if line contains chords (basic detection for [Chord])
      const hasChords = line.includes("[") && line.includes("]");
      
      return (
        <div 
          key={i} 
          className={cn(
            "whitespace-pre-wrap leading-relaxed font-body tracking-tight",
            hasChords ? "text-primary font-bold text-lg mb-0.5" : "text-on-surface text-xl mb-4"
          )}
        >
          {line}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden antialiased select-none">
      {/* Header */}
      <header className="flex h-[72px] items-center justify-between border-b border-outline-variant/30 bg-white px-6 shrink-0 shadow-sm relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-surface-container rounded-2xl p-1 shadow-sm">
            <button
              onClick={prevItem}
              disabled={currentIndex === 0}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white transition-all disabled:opacity-20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextItem}
              disabled={currentIndex === totalItems - 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white transition-all disabled:opacity-20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-on-surface font-headline leading-none mb-1">
              {currentItem?.title || "Cargando..."}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest truncate max-w-[120px]">
                {currentItem?.artist}
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="text-xs font-bold text-primary">{getDisplayKey()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-0.5">Canción</span>
            <span className="text-lg font-bold text-on-surface font-headline leading-none">
              {currentIndex + 1} <span className="text-on-surface-variant/30">/</span> {totalItems}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/10">
              <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
              <span className="text-[10px] font-bold uppercase tracking-widest">En vivo</span>
            </div>
            <button
              onClick={exitLiveMode}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant hover:bg-destructive hover:text-white transition-all shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Structure Strip (Song Parts Quick Access) */}
      <div className="flex h-12 items-center gap-1 px-4 bg-surface-container/50 border-b border-outline-variant/20 overflow-x-auto no-scrollbar">
        {currentItem?.parts.map((part, idx) => (
          <button 
            key={idx}
            className="h-8 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-white hover:text-primary transition-all whitespace-nowrap shadow-sm bg-white/50 border border-outline-variant/10"
          >
            {part.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-10 md:px-12 md:py-16 bg-background/30">
        <div className="max-w-4xl mx-auto space-y-12 pb-32">
          {currentItem?.parts.map((part, idx) => (
            <section key={idx} className="space-y-6 relative">
              <div className="flex items-center gap-3">
                <div className="h-0.5 flex-1 bg-outline-variant/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 px-3 py-1 bg-surface-container rounded-lg border border-outline-variant/10">
                  {part.name}
                </span>
                <div className="h-0.5 flex-1 bg-outline-variant/20" />
              </div>
              <div className="pl-4 border-l-4 border-primary/10 py-2">
                {renderPartContent(part.content)}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer / Transposition Controls */}
      <footer className="fixed bottom-0 left-0 right-0 z-[110] bg-white/95 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-8px_30px_rgba(15,19,34,0.1)] px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTransposition((t) => Math.max(t - 1, -12))}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-primary transition-all active:scale-90"
            >
              <Minus className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Tono</span>
              <span className="text-lg font-bold text-primary font-headline">
                {transposition === 0 ? "ORIGINAL" : `${transposition > 0 ? "+" : ""}${transposition}`}
              </span>
            </div>
            <button
              onClick={() => setTransposition((t) => Math.min(t + 1, 12))}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-primary transition-all active:scale-90"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="h-8 w-px bg-outline-variant/40" />

          <button
            onClick={() => setTransposition(0)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant group-hover:text-primary group-hover:bg-primary-container transition-all group-active:rotate-[-90deg]">
              <RotateCcw className="h-4 w-4" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Reset</span>
          </button>
        </div>
      </footer>
    </div>
  );
}