import { NOTE_NAMES, type NoteName } from "./notes";
import type { Mode, Progress } from "../progress/storage";

export const ROUND_LENGTH = 5;

export function pickRoundNotes(random: () => number = Math.random, preferred: NoteName[] = []): NoteName[] {
  const pool = [...NOTE_NAMES];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = pool[i];
    pool[i] = pool[j];
    pool[j] = current;
  }
  const ordered = [...preferred, ...pool.filter((note) => !preferred.includes(note))];
  return ordered.slice(0, ROUND_LENGTH);
}

type NotePerformance = {
  attempts: number;
  misses: number;
};

function notePerformance(progress: Progress, mode: Mode): Map<NoteName, NotePerformance> {
  const performance = new Map<NoteName, NotePerformance>();
  for (const round of progress.history) {
    if (round.mode !== mode || !round.attempts) continue;
    for (const attempt of round.attempts) {
      const current = performance.get(attempt.note) ?? { attempts: 0, misses: 0 };
      current.attempts += 1;
      if (!attempt.hit) current.misses += 1;
      performance.set(attempt.note, current);
    }
  }
  return performance;
}

/**
 * Selects the next set with an online bandit model.
 *
 * The smoothed miss rate estimates difficulty, while the confidence bonus
 * deliberately explores notes with little or no history.
 */
export function predictNextTrainingSet(progress: Progress, mode: Mode): NoteName[] {
  const performance = notePerformance(progress, mode);
  const totalAttempts = [...performance.values()].reduce((total, note) => total + note.attempts, 0);
  const explorationScale = 0.25 * Math.sqrt(Math.log(totalAttempts + 2));

  return [...NOTE_NAMES]
    .sort((left, right) => {
      const a = performance.get(left) ?? { attempts: 0, misses: 0 };
      const b = performance.get(right) ?? { attempts: 0, misses: 0 };
      const aDifficulty = (a.misses + 1) / (a.attempts + 2);
      const bDifficulty = (b.misses + 1) / (b.attempts + 2);
      const aScore = aDifficulty + explorationScale / Math.sqrt(a.attempts + 1);
      const bScore = bDifficulty + explorationScale / Math.sqrt(b.attempts + 1);
      return bScore - aScore;
    })
    .slice(0, ROUND_LENGTH);
}

export const recommendPracticeNotes = predictNextTrainingSet;
