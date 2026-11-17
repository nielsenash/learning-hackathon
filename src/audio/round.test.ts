import { describe, expect, it } from "vitest";
import { NOTE_NAMES } from "./notes";
import { pickRoundNotes, predictNextTrainingSet, ROUND_LENGTH } from "./round";
import { emptyProgress, recordRound } from "../progress/storage";

describe("pickRoundNotes", () => {
  it("draws five distinct notes", () => {
    const notes = pickRoundNotes(() => 0);
    expect(notes).toHaveLength(ROUND_LENGTH);
    expect(new Set(notes).size).toBe(ROUND_LENGTH);
    expect(notes.every((note) => NOTE_NAMES.includes(note))).toBe(true);
  });
});

describe("predictNextTrainingSet", () => {
  it("prioritizes notes the user misses while retaining exploration", () => {
    let progress = emptyProgress();
    progress = recordRound(
      progress,
      "listen",
      [false, false, false, false, false],
      1,
      [
        { note: "C", hit: false },
        { note: "C", hit: false },
        { note: "C", hit: false },
        { note: "C", hit: false },
        { note: "C", hit: false },
      ],
    );

    const next = predictNextTrainingSet(progress, "listen");
    expect(next[0]).toBe("C");
    expect(next).toHaveLength(ROUND_LENGTH);
    expect(new Set(next).size).toBe(ROUND_LENGTH);
  });

  it("learns each mode independently", () => {
    let progress = emptyProgress();
    progress = recordRound(
      progress,
      "listen",
      [false],
      1,
      [{ note: "C", hit: false }],
    );

    expect(predictNextTrainingSet(progress, "sing")[0]).toBe("C");
  });
});
