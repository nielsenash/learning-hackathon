export const NOTE_NAMES = [
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
  "A4",
  "A#4",
  "B4",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export const PASS_CENTS = 50;
const A4_HZ = 440;
const MIDI_C4 = 60;

const SAMPLE_FILES: Record<NoteName, string> = {
  C4: "C4",
  "C#4": "Cs4",
  D4: "D4",
  "D#4": "Ds4",
  E4: "E4",
  F4: "F4",
  "F#4": "Fs4",
  G4: "G4",
  "G#4": "Gs4",
  A4: "A4",
  "A#4": "As4",
  B4: "B4",
};

export function midiForNote(note: NoteName): number {
  return MIDI_C4 + NOTE_NAMES.indexOf(note);
}

export function frequencyForMidi(midi: number): number {
  return A4_HZ * 2 ** ((midi - 69) / 12);
}

export function frequencyForNote(note: NoteName): number {
  return frequencyForMidi(midiForNote(note));
}

export function centsBetween(detectedHz: number, targetHz: number): number {
  return 1200 * Math.log2(detectedHz / targetHz);
}

export function isPass(cents: number): boolean {
  return Math.abs(cents) <= PASS_CENTS;
}

export function nearestNote(detectedHz: number): NoteName {
  let best: NoteName = NOTE_NAMES[0];
  let bestDistance = Infinity;
  for (const note of NOTE_NAMES) {
    const distance = Math.abs(centsBetween(detectedHz, frequencyForNote(note)));
    if (distance < bestDistance) {
      best = note;
      bestDistance = distance;
    }
  }
  return best;
}

export function formatCents(cents: number): string {
  const rounded = Math.round(cents);
  const value = Object.is(rounded, -0) ? 0 : rounded;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value} cents`;
}

export function sampleFileName(note: NoteName): string {
  return SAMPLE_FILES[note];
}

export function sampleUrl(note: NoteName): string {
  return `/samples/${sampleFileName(note)}.mp3`;
}
