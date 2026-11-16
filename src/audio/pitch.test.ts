import { describe, expect, it } from "vitest";
import { frequencyForNote } from "./notes";
import { estimateStablePitch, scoreSing, selectStableFrequencies } from "./pitch";

function sine(frequency: number, sampleRate: number, length: number, offset = 0): Float32Array {
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const t = (i + offset) / sampleRate;
    samples[i] = Math.sin(2 * Math.PI * frequency * t);
  }
  return samples;
}

describe("selectStableFrequencies", () => {
  it("drops outliers and returns the median of the steady frames", () => {
    expect(selectStableFrequencies([440, 442, 438, 441, 880])).toBeCloseTo(440.5, 1);
  });

  it("rejects a set with no stable cluster", () => {
    expect(selectStableFrequencies([100, 200, 400, 800])).toBeNull();
    expect(selectStableFrequencies([440, 441, 442])).toBeNull();
  });
});

describe("estimateStablePitch", () => {
  it("reads the middle of a clip and ignores the noisy ends", () => {
    const sampleRate = 44100;
    const length = sampleRate * 2;
    const samples = new Float32Array(length);
    const start = Math.floor(length * 0.2);
    const end = Math.ceil(length * 0.8);
    samples.set(sine(180, sampleRate, start), 0);
    samples.set(sine(440, sampleRate, end - start, start), start);
    samples.set(sine(180, sampleRate, length - end, end), end);

    const estimate = estimateStablePitch(samples, sampleRate);
    expect(estimate.ok).toBe(true);
    if (estimate.ok) expect(estimate.frequency).toBeCloseTo(440, 0);
  });

  it("fails when no stable pitch is present", () => {
    expect(estimateStablePitch(new Float32Array(1000), 44100).ok).toBe(false);
    expect(estimateStablePitch(new Float32Array(44100), 44100).ok).toBe(false);
  });
});

describe("scoreSing", () => {
  it("passes a note within 50 cents and names it", () => {
    const sampleRate = 44100;
    const target = frequencyForNote("G4") * 2 ** (40 / 1200);
    const score = scoreSing("G4", sine(target, sampleRate, sampleRate * 2), sampleRate);
    expect(score.pass).toBe(true);
    expect(score.detectedNote).toBe("G4");
    expect(score.cents).toBeCloseTo(40, 0);
  });

  it("fails a note past the quarter-tone line and still names the nearest note", () => {
    const sampleRate = 44100;
    const sung = frequencyForNote("E4") * 2 ** (40 / 1200);
    const score = scoreSing("C4", sine(sung, sampleRate, sampleRate * 2), sampleRate);
    expect(score.pass).toBe(false);
    expect(score.detectedNote).toBe("E4");
    expect(score.cents).not.toBeNull();
    expect(Math.abs(score.cents ?? 0)).toBeGreaterThan(50);
  });

  it("fails when the clip has no stable pitch", () => {
    expect(scoreSing("A4", new Float32Array(44100), 44100)).toEqual({
      pass: false,
      detectedNote: null,
      cents: null,
    });
  });
});
