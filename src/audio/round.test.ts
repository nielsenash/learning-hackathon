import { describe, expect, it } from "vitest";
import { NOTE_NAMES } from "./notes";
import { pickRoundNotes, ROUND_LENGTH } from "./round";

describe("pickRoundNotes", () => {
  it("draws five distinct notes", () => {
    const notes = pickRoundNotes(() => 0);
    expect(notes).toHaveLength(ROUND_LENGTH);
    expect(new Set(notes).size).toBe(ROUND_LENGTH);
    expect(notes.every((note) => NOTE_NAMES.includes(note))).toBe(true);
  });
});
