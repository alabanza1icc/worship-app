"use client";

import { useMemo } from "react";
import { transposeLyricsWithChords } from "@/lib/chart-pro";
import { cn } from "@/lib/utils";

interface ChordSheetProps {
  content: string;
  transposition?: number;
  sectionColor?: "verse" | "chorus" | "bridge" | "intro" | "outro" | "other";
}

const SECTION_COLORS = {
  verse: "text-primary",
  chorus: "text-amber-600",
  bridge: "text-purple-600",
  intro: "text-teal-600",
  outro: "text-pink-600",
  other: "text-primary",
};

interface Chunk {
  chord: string | null;
  text: string;
}

/**
 * Parses a line into chunks of { chord, text }
 * Example: "[Sol]Tú eres [Mi]Rey" 
 * -> [{chord: "Sol", text: "Tú eres "}, {chord: "Mi", text: "Rey"}]
 */
function parseLineIntoChunks(line: string): Chunk[] {
  const chunks: Chunk[] = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  // Case 1: Line starts with text before any chord
  const firstMatch = regex.exec(line);
  if (firstMatch && firstMatch.index > 0) {
    chunks.push({ chord: null, text: line.substring(0, firstMatch.index) });
  } else if (!firstMatch) {
    // No chords at all
    return [{ chord: null, text: line }];
  }
  
  // Reset regex
  regex.lastIndex = 0;

  while ((match = regex.exec(line)) !== null) {
    const chord = match[1];
    const startOfText = regex.lastIndex;
    
    // Look ahead for the next chord to find the end of this text segment
    const nextMatch = /\[([^\]]+)\]/g;
    nextMatch.lastIndex = startOfText;
    const nextChord = nextMatch.exec(line);
    
    const endOfText = nextChord ? nextChord.index : line.length;
    const text = line.substring(startOfText, endOfText);
    
    chunks.push({ chord, text });
  }

  return chunks;
}

function ChordLine({
  content,
  transposition,
  colorClass,
}: {
  content: string;
  transposition: number;
  colorClass: string;
}) {
  const transposed = useMemo(
    () => (transposition !== 0 ? transposeLyricsWithChords(content, transposition) : content),
    [content, transposition]
  );

  // Fix literal \n characters and split by real newlines
  const lines = transposed.replace(/\\n/g, "\n").split("\n");

  return (
    <div className="space-y-6">
      {lines.map((line, lineIndex) => {
        if (!line.trim()) {
          return <div key={lineIndex} className="h-6" />;
        }

        const chunks = parseLineIntoChunks(line);

        return (
          <div key={lineIndex} className="flex flex-wrap items-end row-gap-2">
            {chunks.map((chunk, i) => (
              <div key={i} className="flex flex-col min-w-fit">
                {/* Chord layer */}
                <div className={cn(
                  "h-6 text-[15px] font-black tracking-tight flex items-center mb-0.5",
                  colorClass
                )}>
                  {chunk.chord ? (
                    <span className="pr-2">{chunk.chord}</span>
                  ) : (
                    <span className="invisible">_</span>
                  )}
                </div>
                {/* Lyric layer */}
                <div className="text-lg font-bold text-on-surface leading-none whitespace-pre">
                  {chunk.text || <span className="invisible">_</span>}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function ChordSheet({
  content,
  transposition = 0,
  sectionColor = "other",
}: ChordSheetProps) {
  const colorClass = SECTION_COLORS[sectionColor];

  return (
    <div className="bg-white rounded-[32px] p-8 border border-outline-variant/10 shadow-sm">
      <ChordLine content={content} transposition={transposition} colorClass={colorClass} />
    </div>
  );
}

interface SongPartsDisplayProps {
  parts: { id: string; name: string; content: string }[];
  transposition: number;
}

const PART_COLORS: Record<string, "verse" | "chorus" | "bridge" | "intro" | "outro" | "other"> = {
  verso: "verse",
  chorus: "chorus",
  coro: "chorus",
  puente: "bridge",
  intro: "intro",
  instrumental: "intro",
  outro: "outro",
  final: "outro",
};

function getSectionColor(partName: string): "verse" | "chorus" | "bridge" | "intro" | "outro" | "other" {
  const normalized = partName.toLowerCase();
  for (const [key, value] of Object.entries(PART_COLORS)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  return "other";
}

function abbreviateSection(name: string): string {
  const lower = name.toLowerCase();

  if (lower.includes("intro")) return "In";
  if (lower.includes("outro") || lower.includes("final")) return "Out";
  if (lower.includes("verso")) {
    const num = lower.match(/(\d+)/)?.[1] || "";
    return num ? `V${num}` : "V";
  }
  if (lower.includes("coro")) {
    const num = lower.match(/(\d+)/)?.[1] || "";
    return num ? `C${num}` : "C";
  }
  if (lower.includes("pre-coro") || lower.includes("pre coro")) {
    const num = lower.match(/(\d+)/)?.[1] || "";
    return num ? `PC${num}` : "PC";
  }
  if (lower.includes("puente") || lower.includes("bridge")) {
    const num = lower.match(/(\d+)/)?.[1] || "";
    return num ? `B${num}` : "B";
  }
  if (lower.includes("instrumental") || lower.includes("solo")) {
    return "Inst";
  }
  if (lower.includes("tag")) return "Tag";
  if (lower.includes("breakdown")) return "Brk";

  return name.slice(0, 2).toUpperCase();
}

const SECTION_BADGE_COLORS = {
  verse: "bg-primary/10 text-primary border-primary/20",
  chorus: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  bridge: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  intro: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  outro: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  other: "bg-surface-container text-on-surface-variant border-outline-variant/10",
};

export function SongPartsDisplay({ parts, transposition }: SongPartsDisplayProps) {
  return (
    <div className="space-y-12">
      {parts.map((part) => {
        const sectionType = getSectionColor(part.name);
        const badgeColor = SECTION_BADGE_COLORS[sectionType];
        
        return (
          <div key={part.id} id={`part-${part.id}`} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-5 px-2">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border shadow-sm",
                badgeColor
              )}>
                {abbreviateSection(part.name)}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 leading-none mb-1">
                  Sección
                </span>
                <span className="text-base font-black text-on-surface uppercase tracking-widest leading-none">
                  {part.name}
                </span>
              </div>
            </div>
            <ChordSheet
              content={part.content}
              transposition={transposition}
              sectionColor={sectionType}
            />
          </div>
        );
      })}
    </div>
  );
}

export { abbreviateSection, getSectionColor };