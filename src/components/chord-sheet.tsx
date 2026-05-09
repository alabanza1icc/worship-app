"use client";

import { useMemo } from "react";
import { transposeLyricsWithChords } from "@/lib/chart-pro";

interface ChordSheetProps {
  content: string;
  transposition?: number;
  sectionColor?: "verse" | "chorus" | "bridge" | "intro" | "outro" | "other";
}

const SECTION_COLORS = {
  verse: "text-blue-400",
  chorus: "text-orange-400",
  bridge: "text-purple-400",
  intro: "text-teal-400",
  outro: "text-pink-400",
  other: "text-primary",
};

interface ParsedToken {
  type: "chord" | "lyric";
  value: string;
}

interface LineTokens {
  chords: string[];
  lyrics: string;
}

function parseLine(line: string): LineTokens {
  const tokens: ParsedToken[] = [];
  const regex = /(\[[^\]]+\])|([^\[]+)/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match[1]) {
      tokens.push({ type: "chord", value: match[1] });
    } else if (match[2]) {
      tokens.push({ type: "lyric", value: match[2] });
    }
  }

  const chords: string[] = [];
  const lyricsParts: string[] = [];

  tokens.forEach((token) => {
    if (token.type === "chord") {
      chords.push(token.value.slice(1, -1));
    } else {
      const chars = token.value.split("");
      chars.forEach((char, i) => {
        if (lyricsParts.length < chords.length) {
          lyricsParts.push(char);
        } else {
          const lastIndex = lyricsParts.length - 1;
          lyricsParts[lastIndex] = (lyricsParts[lastIndex] || "") + char;
        }
      });
    }
  });

  while (lyricsParts.length < chords.length) {
    lyricsParts.push("");
  }

  return { chords, lyrics: lyricsParts.join("") };
}

function findChordPositions(lyrics: string): number[] {
  const positions: number[] = [];
  const regex = /\[([^\]]+)\]/g;
  let match;

  const testStr = lyrics.replace(/\[([^\]]+)\]/g, (m, p1, offset) => {
    positions.push(offset);
    return p1;
  });

  return positions;
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

  const lines = transposed.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, lineIndex) => {
        if (!line.trim()) {
          return <div key={lineIndex} className="h-4" />;
        }

        const { chords, lyrics } = parseLine(line);

        if (chords.length === 0) {
          return (
            <div key={lineIndex} className="text-xl text-white font-body leading-relaxed py-1">
              {lyrics}
            </div>
          );
        }

        return (
          <div key={lineIndex} className="font-mono text-base leading-8">
            <div className={`${colorClass} font-bold tracking-tight`}>
              {chords.join("  ")}
            </div>
            <div className="text-white">{lyrics}</div>
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
    <div className="bg-surface rounded-xl p-6 border border-white/5">
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

export function SongPartsDisplay({ parts, transposition }: SongPartsDisplayProps) {
  return (
    <div className="space-y-8">
      {parts.map((part) => (
        <div key={part.id}>
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                part.name.toLowerCase().includes("coro")
                  ? "bg-orange-500/20 text-orange-400"
                  : part.name.toLowerCase().includes("verso")
                  ? "bg-blue-500/20 text-blue-400"
                  : part.name.toLowerCase().includes("puente")
                  ? "bg-purple-500/20 text-purple-400"
                  : part.name.toLowerCase().includes("intro")
                  ? "bg-teal-500/20 text-teal-400"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {abbreviateSection(part.name)}
            </span>
            <span className="text-on-surface-variant uppercase text-xs tracking-widest">
              {part.name}
            </span>
          </div>
          <ChordSheet
            content={part.content}
            transposition={transposition}
            sectionColor={getSectionColor(part.name)}
          />
        </div>
      ))}
    </div>
  );
}

export { abbreviateSection, getSectionColor };