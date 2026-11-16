import { useEffect, useState } from "react";
import { formatCents } from "../audio/notes";
import { scoreSing, type SingScore } from "../audio/pitch";
import { playNote, stopPlayback } from "../audio/player";
import { recordClip } from "../audio/recorder";
import { pickRoundNotes } from "../audio/round";

type Props = {
  onExit: () => void;
  onMicDenied: () => void;
  onComplete: (hits: boolean[]) => void;
};

type Phase = "idle" | "recording" | "revealed";

export function SingRound({ onExit, onMicDenied, onComplete }: Props) {
  const [notes] = useState(pickRoundNotes);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [hits, setHits] = useState<boolean[]>([]);
  const [score, setScore] = useState<SingScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const target = notes[index];

  useEffect(() => {
    let cancelled = false;
    setError(null);
    playNote(target).catch(() => {
      if (!cancelled) setError("Could not play the reference.");
    });
    return () => {
      cancelled = true;
      stopPlayback();
    };
  }, [target]);

  async function record() {
    if (phase !== "idle") return;
    setError(null);
    setPhase("recording");
    stopPlayback();
    try {
      const clip = await recordClip(2);
      const result = scoreSing(target, clip.samples, clip.sampleRate);
      setScore(result);
      setHits((prev) => [...prev, result.pass]);
      setPhase("revealed");
    } catch (err) {
      setPhase("idle");
      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "NotFoundError" || err.name === "SecurityError")
      ) {
        onMicDenied();
        return;
      }
      setError("Could not record. Check the microphone and try again.");
    }
  }

  function next() {
    if (phase !== "revealed" || !score) return;
    if (index === notes.length - 1) {
      onComplete(hits);
      return;
    }
    setScore(null);
    setPhase("idle");
    setIndex((current) => current + 1);
  }

  return (
    <section>
      <div className="topbar">
        <p className="eyebrow">Sing and match</p>
        <button type="button" className="ghost" onClick={onExit} disabled={phase === "recording"}>
          Exit round
        </button>
      </div>
      <h1>
        Note {index + 1} of {notes.length}
      </h1>
      <p className="muted">Target note</p>
      <p className="target">{target}</p>
      <div className="row">
        <button
          type="button"
          className="secondary"
          disabled={phase === "recording"}
          onClick={() => void playNote(target)}
        >
          Play reference
        </button>
        <button type="button" className="primary" disabled={phase !== "idle"} onClick={() => void record()}>
          {phase === "recording" ? "Recording…" : "Record"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {phase === "recording" && <p className="muted">Listening for about 2 seconds. Hum or sing the target.</p>}
      {score && (
        <div className={score.pass ? "result pass" : "result fail"} role="status">
          <p>
            <strong>{score.pass ? "Pass" : "Fail"}</strong>
          </p>
          <p>Detected note: {score.detectedNote ?? "—"}</p>
          <p>Error: {score.cents === null ? "—" : formatCents(score.cents)}</p>
          {score.cents === null && <p>No stable pitch detected.</p>}
        </div>
      )}
      <button type="button" className="primary" disabled={phase !== "revealed"} onClick={next}>
        {index === notes.length - 1 ? "See score" : "Next"}
      </button>
    </section>
  );
}
