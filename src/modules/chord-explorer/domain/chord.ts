export type ChordType = "major" | "minor" | "maj7" | "min7" | "dom7";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const INTERVALS: Record<ChordType, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
};

export function chordNotes(root: string, type: ChordType): string[] {
  const index = NOTES.indexOf(root);
  if (index === -1) return [];
  return INTERVALS[type].map((step) => NOTES[(index + step) % 12]);
}

export function chordName(root: string, type: ChordType): string {
  const suffix =
    type === "major"
      ? ""
      : type === "minor"
        ? "m"
        : type === "maj7"
          ? "maj7"
          : type === "min7"
            ? "m7"
            : "7";
  return `${root}${suffix}`;
}

export function noteOptions(): string[] {
  return NOTES;
}
