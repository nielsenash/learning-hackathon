import { NOTE_NAMES, type NoteName } from "../audio/notes";

export type Mode = "listen" | "sing";

export type RoundRecord = {
  mode: Mode;
  score: number;
  timestamp: number;
  attempts?: NoteAttempt[];
};

export type NoteAttempt = {
  note: NoteName;
  hit: boolean;
};

export type ModeProgress = {
  best: number | null;
  streak: number;
};

export type Progress = {
  listen: ModeProgress;
  sing: ModeProgress;
  history: RoundRecord[];
};

const LEGACY_STORAGE_KEY = "pitch-recognition-progress";
const HISTORY_LIMIT = 10;

type KeyValueStore = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export function emptyProgress(): Progress {
  return {
    listen: { best: null, streak: 0 },
    sing: { best: null, streak: 0 },
    history: [],
  };
}

export function nextStreak(current: number, hits: boolean[]): number {
  return hits.reduce((streak, hit) => (hit ? streak + 1 : 0), current);
}

export function recordRound(
  progress: Progress,
  mode: Mode,
  hits: boolean[],
  timestamp = Date.now(),
  attempts?: NoteAttempt[],
): Progress {
  const score = hits.filter(Boolean).length;
  const current = progress[mode];
  const best = current.best === null ? score : Math.max(current.best, score);
  const history = [{ mode, score, timestamp, ...(attempts ? { attempts } : {}) }, ...progress.history].slice(
    0,
    HISTORY_LIMIT,
  );
  return {
    ...progress,
    [mode]: { best, streak: nextStreak(current.streak, hits) },
    history,
  };
}

function isModeProgress(value: unknown): value is ModeProgress {
  if (!value || typeof value !== "object") return false;
  const record = value as ModeProgress;
  const bestOk =
    record.best === null ||
    (typeof record.best === "number" &&
      Number.isInteger(record.best) &&
      record.best >= 0 &&
      record.best <= 5);
  return (
    bestOk &&
    typeof record.streak === "number" &&
    Number.isInteger(record.streak) &&
    record.streak >= 0
  );
}

function isRoundRecord(value: unknown): value is RoundRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as RoundRecord;
  const attempts = record.attempts;
  const attemptsOk =
    attempts === undefined ||
    (Array.isArray(attempts) &&
      attempts.length <= 5 &&
      attempts.every((attempt) => {
        if (!attempt || typeof attempt !== "object") return false;
        const item = attempt as NoteAttempt;
        return NOTE_NAMES.includes(item.note) && typeof item.hit === "boolean";
      }));
  return (
    (record.mode === "listen" || record.mode === "sing") &&
    typeof record.score === "number" &&
    Number.isInteger(record.score) &&
    record.score >= 0 &&
    record.score <= 5 &&
    typeof record.timestamp === "number" &&
    Number.isFinite(record.timestamp) &&
    attemptsOk
  );
}

function isProgress(value: unknown): value is Progress {
  if (!value || typeof value !== "object") return false;
  const record = value as Progress;
  return (
    isModeProgress(record.listen) &&
    isModeProgress(record.sing) &&
    Array.isArray(record.history) &&
    record.history.length <= HISTORY_LIMIT &&
    record.history.every(isRoundRecord)
  );
}

export function loadProgress(
  storage: Pick<KeyValueStore, "getItem"> = localStorage,
  storageKey = LEGACY_STORAGE_KEY,
): Progress {
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return emptyProgress();
    const parsed: unknown = JSON.parse(raw);
    return isProgress(parsed) ? parsed : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(
  progress: Progress,
  storage: KeyValueStore = localStorage,
  storageKey = LEGACY_STORAGE_KEY,
): void {
  storage.setItem(storageKey, JSON.stringify(progress));
}
