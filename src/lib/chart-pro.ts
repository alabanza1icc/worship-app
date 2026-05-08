export interface ChartProContent {
  title: string;
  tempo?: number;
  key?: string;
  chords?: string[];
  sections: {
    name: string;
    lyrics: string;
  }[];
}

const KEYS = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
const KEY_ENGLISH_TO_SPANISH: Record<string, string> = {
  "C": "Do",
  "C#": "Do#",
  "D": "Re",
  "D#": "Re#",
  "E": "Mi",
  "F": "Fa",
  "F#": "Fa#",
  "G": "Sol",
  "G#": "Sol#",
  "A": "La",
  "A#": "La#",
  "B": "Si",
};

const KEY_SPANISH_TO_ENGLISH: Record<string, string> = {
  "Do": "C",
  "Do#": "C#",
  "Re": "D",
  "Re#": "D#",
  "Mi": "E",
  "Fa": "F",
  "Fa#": "F#",
  "Sol": "G",
  "Sol#": "G#",
  "La": "A",
  "La#": "A#",
  "Si": "B",
};

export function normalizeKey(key: string): string {
  if (!key) return "Do";
  const upper = key.charAt(0).toUpperCase() + key.slice(1);
  return KEY_ENGLISH_TO_SPANISH[upper] || upper;
}

export function transposeKey(key: string, semitones: number): string {
  if (semitones === 0) return key;
  const normalized = normalizeKey(key);
  const index = KEYS.indexOf(normalized);
  if (index === -1) return key;
  const newIndex = (index + semitones + 12) % 12;
  return KEYS[newIndex];
}

export function parseChartProContent(content: string): ChartProContent | null {
  try {
    return JSON.parse(content) as ChartProContent;
  } catch {
    return null;
  }
}

export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;
  const normalized = normalizeKey(chord.replace(/[0-9]/g, ""));
  const baseIndex = KEYS.indexOf(normalized);
  if (baseIndex === -1) return chord;
  const newIndex = (baseIndex + semitones + 12) % 12;
  const newKey = KEYS[newIndex];
  const suffix = chord.replace(/[A-Za-z#]/g, "");
  return newKey + suffix;
}

export function transposeLyricsWithChords(
  content: string,
  semitones: number
): string {
  if (semitones === 0) return content;
  const chordPattern = /\[([A-Za-z#0-9]+)\]/g;
  return content.replace(chordPattern, (_, chord) => {
    return `[${transposeChord(chord, semitones)}]`;
  });
}

export function parseSongPartsContent(
  parts: { name: string; content: string }[],
  semitones: number
): { name: string; content: string }[] {
  return parts.map((part) => ({
    name: part.name,
    content: transposeLyricsWithChords(part.content, semitones),
  }));
}