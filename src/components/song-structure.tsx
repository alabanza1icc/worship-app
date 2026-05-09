"use client";

import { useRef, useEffect } from "react";
import { abbreviateSection } from "./chord-sheet";

interface SongPart {
  id: string;
  name: string;
}

interface SongStructureProps {
  parts: SongPart[];
  activePartId?: string;
  onPartClick?: (partId: string) => void;
  editable?: boolean;
}

const PART_COLORS: Record<string, { bg: string; text: string }> = {
  verso: { bg: "bg-blue-500/20", text: "text-blue-400" },
  chorus: { bg: "bg-orange-500/20", text: "text-orange-400" },
  coro: { bg: "bg-orange-500/20", text: "text-orange-400" },
  puente: { bg: "bg-purple-500/20", text: "text-purple-400" },
  bridge: { bg: "bg-purple-500/20", text: "text-purple-400" },
  intro: { bg: "bg-teal-500/20", text: "text-teal-400" },
  outro: { bg: "bg-pink-500/20", text: "text-pink-400" },
  final: { bg: "bg-pink-500/20", text: "text-pink-400" },
};

function getPartColor(name: string): { bg: string; text: string } {
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(PART_COLORS)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  return { bg: "bg-white/10", text: "text-white/70" };
}

export function SongStructure({
  parts,
  activePartId,
  onPartClick,
  editable = false,
}: SongStructureProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activePartId]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {parts.map((part) => {
          const colors = getPartColor(part.name);
          const isActive = part.id === activePartId;

          return (
            <button
              key={part.id}
              onClick={() => onPartClick?.(part.id)}
              disabled={!onPartClick}
              ref={isActive ? activeRef : null}
              className={`
                flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center
                transition-all duration-200
                ${colors.bg}
                ${isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : ""}
                ${editable ? "cursor-grab active:cursor-grabbing" : ""}
                ${onPartClick ? "hover:scale-105" : ""}
              `}
            >
              <span className={`text-sm font-bold ${colors.text}`}>
                {abbreviateSection(part.name)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}

interface StructurePreviewProps {
  parts: { name: string }[];
}

export function StructurePreview({ parts }: StructurePreviewProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {parts.map((part, index) => {
        const colors = getPartColor(part.name);
        return (
          <span
            key={index}
            className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            {abbreviateSection(part.name)}
          </span>
        );
      })}
    </div>
  );
}