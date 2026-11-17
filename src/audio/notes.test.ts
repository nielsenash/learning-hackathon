import { describe, expect, it } from "vitest";
import {
  centsBetween,
  formatCents,
  frequencyForNote,
  isPass,
  nearestNote,
  NOTE_NAMES,
  pitchClassCentsBetween,
} from "./notes";

describe("note frequencies", () => {
  it("uses A4 = 440 Hz and rises across the octave", () => {
    expect(frequencyForNote("A")).toBe(440);
    expect(frequencyForNote("C")).toBeCloseTo(261.6256, 3);
    expect(frequencyForNote("B")).toBeCloseTo(493.8833, 3);
    for (let i = 1; i < NOTE_NAMES.length; i += 1) {
      expect(frequencyForNote(NOTE_NAMES[i])).toBeGreaterThan(frequencyForNote(NOTE_NAMES[i - 1]));
    }
  });
});

describe("cents and the pass line", () => {
  it("measures signed distance from the target", () => {
    const target = frequencyForNote("A");
    expect(centsBetween(target, target)).toBe(0);
    expect(centsBetween(target * 2 ** (50 / 1200), target)).toBeCloseTo(50, 6);
    expect(centsBetween(target * 2 ** (-25 / 1200), target)).toBeCloseTo(-25, 6);
  });

  it("ignores octave differences while measuring pitch class", () => {
    const target = frequencyForNote("C");
    expect(pitchClassCentsBetween(target / 2, target)).toBeCloseTo(0, 6);
    expect(pitchClassCentsBetween(target * 2, target)).toBeCloseTo(0, 6);
  });

  it("passes at 50 cents and fails beyond a quarter tone", () => {
    expect(isPass(0)).toBe(true);
    expect(isPass(50)).toBe(true);
    expect(isPass(-50)).toBe(true);
    expect(isPass(50.01)).toBe(false);
    expect(isPass(-50.01)).toBe(false);
  });

  it("formats cents with a sign", () => {
    expect(formatCents(12.4)).toBe("+12 cents");
    expect(formatCents(-12.6)).toBe("-13 cents");
    expect(formatCents(0.2)).toBe("0 cents");
  });
});

describe("nearest note", () => {
  it("names the closest pitch class across octaves", () => {
    expect(nearestNote(frequencyForNote("F#"))).toBe("F#");
    expect(nearestNote(frequencyForNote("C") / 2 * 2 ** (60 / 1200))).toBe("C#");
    expect(nearestNote(82)).toBe("E");
    expect(nearestNote(500)).toBe("B");
  });
});
