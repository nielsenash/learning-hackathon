import { PitchDetector } from "pitchy";
import {
  centsBetween,
  frequencyForNote,
  isPass,
  nearestNote,
  pitchClassCentsBetween,
  type NoteName,
} from "./notes";

const FRAME_SIZE = 2048;
const HOP_SIZE = 256;
const MIN_CLARITY = 0.85;
const MIN_HZ = 80;
const MAX_HZ = 1000;
const MIN_FRAMES = 4;
const OUTLIER_CENTS = 100;

export type PitchEstimate = { ok: true; frequency: number } | { ok: false };

export type SingScore = {
  pass: boolean;
  detectedNote: NoteName | null;
  cents: number | null;
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

export function selectStableFrequencies(pitches: number[]): number | null {
  if (pitches.length < MIN_FRAMES) return null;
  const first = median(pitches);
  const stable = pitches.filter((hz) => Math.abs(centsBetween(hz, first)) <= OUTLIER_CENTS);
  if (stable.length < MIN_FRAMES) return null;
  return median(stable);
}

export function estimateStablePitch(samples: Float32Array, sampleRate: number): PitchEstimate {
  if (samples.length < FRAME_SIZE || sampleRate <= 0) return { ok: false };
  const start = Math.floor(samples.length * 0.2);
  const end = Math.ceil(samples.length * 0.8);
  const region = samples.subarray(start, end);
  if (region.length < FRAME_SIZE) return { ok: false };

  const detector = PitchDetector.forFloat32Array(FRAME_SIZE);
  const pitches: number[] = [];
  for (let offset = 0; offset + FRAME_SIZE <= region.length; offset += HOP_SIZE) {
    const frame = region.slice(offset, offset + FRAME_SIZE);
    const [pitch, clarity] = detector.findPitch(frame, sampleRate);
    if (clarity >= MIN_CLARITY && pitch >= MIN_HZ && pitch <= MAX_HZ) pitches.push(pitch);
  }

  const frequency = selectStableFrequencies(pitches);
  if (frequency === null) return { ok: false };
  return { ok: true, frequency };
}

export function scoreSing(target: NoteName, samples: Float32Array, sampleRate: number): SingScore {
  const estimate = estimateStablePitch(samples, sampleRate);
  if (!estimate.ok) return { pass: false, detectedNote: null, cents: null };
  const cents = pitchClassCentsBetween(estimate.frequency, frequencyForNote(target));
  return {
    pass: isPass(cents),
    detectedNote: nearestNote(estimate.frequency),
    cents,
  };
}
