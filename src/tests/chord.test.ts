import { describe, expect, it } from "vitest";

import {
  chordName,
  chordNotes,
  noteOptions,
} from "@/modules/chord-explorer/domain/chord";

describe("chord explorer domain", () => {
  it("returns notes for major chord", () => {
    expect(chordNotes("C", "major")).toEqual(["C", "E", "G"]);
  });

  it("builds chord names", () => {
    expect(chordName("A", "minor")).toBe("Am");
    expect(noteOptions().length).toBe(12);
  });
});
