import type { Mode } from "../progress/storage";

const MODE_LABEL: Record<Mode, string> = {
  listen: "Listen and identify",
  sing: "Sing and match",
};

type Props = {
  mode: Mode;
  score: number;
  busy: boolean;
  onHome: () => void;
  onAgain: () => void;
};

export function Summary({ mode, score, busy, onHome, onAgain }: Props) {
  return (
    <section>
      <p className="eyebrow">{MODE_LABEL[mode]}</p>
      <h1>Round complete</h1>
      <p className="scoreline">
        <strong>{score}</strong> out of 5
      </p>
      <div className="row">
        <button type="button" className="primary" disabled={busy} onClick={onAgain}>
          {busy ? "Requesting microphone…" : "Play again"}
        </button>
        <button type="button" className="secondary" disabled={busy} onClick={onHome}>
          Home
        </button>
      </div>
    </section>
  );
}
