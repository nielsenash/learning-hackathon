import { NOTE_NAMES, type NoteName } from "./notes";

export const ROUND_LENGTH = 5;

export function pickRoundNotes(random: () => number = Math.random): NoteName[] {
  const pool = [...NOTE_NAMES];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = pool[i];
    pool[i] = pool[j];
    pool[j] = current;
  }
  return pool.slice(0, ROUND_LENGTH);
}
