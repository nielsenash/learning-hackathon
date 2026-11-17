export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export const NOTE_OCTAVES = [3, 4, 5] as const;
export type NoteOctave = (typeof NOTE_OCTAVES)[number];

export const PASS_CENTS = 50;
const A4_HZ = 440;
const MIDI_C4 = 60;

const SAMPLE_FILES: Record<NoteName, string> = {
  C: "C4",
  "C#": "Cs4",
  D: "D4",
  "D#": "Ds4",
  E: "E4",
  F: "F4",
  "F#": "Fs4",
  G: "G4",
  "G#": "Gs4",
  A: "A4",
  "A#": "As4",
  B: "B4",
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

export function randomOctave(random: () => number = Math.random): NoteOctave {
  return NOTE_OCTAVES[Math.floor(random() * NOTE_OCTAVES.length)];
}

export function centsBetween(detectedHz: number, targetHz: number): number {
  return 1200 * Math.log2(detectedHz / targetHz);
}

export function pitchClassCentsBetween(detectedHz: number, targetHz: number): number {
  const cents = centsBetween(detectedHz, targetHz);
  return ((cents + 600) % 1200 + 1200) % 1200 - 600;
}

export function isPass(cents: number): boolean {
  return Math.abs(cents) <= PASS_CENTS;
}

export function nearestNote(detectedHz: number): NoteName {
  let best: NoteName = NOTE_NAMES[0];
  let bestDistance = Infinity;
  for (const note of NOTE_NAMES) {
    const distance = Math.abs(pitchClassCentsBetween(detectedHz, frequencyForNote(note)));
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
