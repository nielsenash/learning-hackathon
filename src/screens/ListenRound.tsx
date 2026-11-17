import { useEffect, useState } from "react";
import { NOTE_NAMES, type NoteName } from "../audio/notes";
import { playNote, stopPlayback } from "../audio/player";
import { pickRoundNotes } from "../audio/round";
import type { NoteAttempt } from "../progress/storage";

type Props = {
  onExit: () => void;
  notes?: NoteName[];
  onComplete: (hits: boolean[], attempts: NoteAttempt[]) => void;
};

export function ListenRound({ onExit, notes: selectedNotes, onComplete }: Props) {
  const [notes] = useState(() => selectedNotes ?? pickRoundNotes());
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<NoteName | null>(null);
  const [hits, setHits] = useState<boolean[]>([]);
  const [attempts, setAttempts] = useState<NoteAttempt[]>([]);
  const [playError, setPlayError] = useState<string | null>(null);
  const target = notes[index];

  useEffect(() => {
    let cancelled = false;
    setPlayError(null);
    playNote(target).catch(() => {
      if (!cancelled) setPlayError("Could not play that sample.");
    });
    return () => {
      cancelled = true;
      stopPlayback();
    };
  }, [target]);

  function choose(note: NoteName) {
    if (choice) return;
    setChoice(note);
    setHits((prev) => [...prev, note === target]);
    setAttempts((prev) => [...prev, { note: target, hit: note === target }]);
  }

  function next() {
    if (!choice) return;
    if (index === notes.length - 1) {
      onComplete(hits, attempts);
      return;
    }
    setChoice(null);
    setIndex((current) => current + 1);
  }

  const correct = choice === target;

  return (
    <section>
      <div className="topbar">
        <p className="eyebrow">Listen and identify</p>
        <button type="button" className="ghost" onClick={onExit}>
          Exit round
        </button>
      </div>
      <h1>
        Note {index + 1} of {notes.length}
      </h1>
      <div className="row">
        <button type="button" className="secondary" disabled={choice !== null} onClick={() => void playNote(target)}>
          Replay
        </button>
      </div>
      {playError && <p className="error">{playError}</p>}
      <div className="note-grid">
        {NOTE_NAMES.map((note) => {
          const className = [
            "note",
            choice && note === target ? "correct" : "",
            choice && note === choice && note !== target ? "wrong" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={note}
              type="button"
              className={className}
              disabled={choice !== null}
              onClick={() => choose(note)}
            >
              {note}
            </button>
          );
        })}
      </div>
      {choice && (
        <div className={correct ? "result pass" : "result fail"} role="status">
          <strong>{correct ? "Correct" : "Incorrect"}.</strong> The note was {target}.
        </div>
      )}
      <button type="button" className="primary" disabled={!choice} onClick={next}>
        {index === notes.length - 1 ? "See score" : "Next"}
      </button>
    </section>
  );
}
