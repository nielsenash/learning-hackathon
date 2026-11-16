import type { Mode, Progress } from "../progress/storage";

const MODE_LABEL: Record<Mode, string> = {
  listen: "Listen and identify",
  sing: "Sing and match",
};

type Props = {
  progress: Progress;
  startingSing: boolean;
  onStartListen: () => void;
  onStartSing: () => void;
};

function formatWhen(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

function ModeCard({
  title,
  text,
  best,
  streak,
  started,
  action,
  disabled,
  onStart,
}: {
  title: string;
  text: string;
  best: number | null;
  streak: number;
  started: boolean;
  action: string;
  disabled: boolean;
  onStart: () => void;
}) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="stats">
        <p className="stat">
          <span>Best</span>
          <strong>{best === null ? "—" : `${best} / 5`}</strong>
        </p>
        <p className="stat">
          <span>Streak</span>
          <strong>{started ? streak : "—"}</strong>
        </p>
      </div>
      <button type="button" className="primary" disabled={disabled} onClick={onStart}>
        {action}
      </button>
    </section>
  );
}

export function Home({ progress, startingSing, onStartListen, onStartSing }: Props) {
  return (
    <>
      <header>
        <h1>Pitch Recognition</h1>
        <p className="lede">
          Hear a piano note and name it, or sing a note and see how close you were. Scores stay in this
          browser.
        </p>
      </header>
      <div className="modes">
        <ModeCard
          title="Listen and identify"
          text="A note plays. Pick the matching name from C4 to B4. Five notes per round."
          best={progress.listen.best}
          streak={progress.listen.streak}
          started={progress.listen.best !== null}
          action="Start listen round"
          disabled={startingSing}
          onStart={onStartListen}
        />
        <ModeCard
          title="Sing and match"
          text="Hum or sing the target note for about two seconds. Within 50 cents is a pass."
          best={progress.sing.best}
          streak={progress.sing.streak}
          started={progress.sing.best !== null}
          action={startingSing ? "Requesting microphone…" : "Start sing round"}
          disabled={startingSing}
          onStart={onStartSing}
        />
      </div>
      <section className="card history-card">
        <h2>Recent rounds</h2>
        {progress.history.length === 0 ? (
          <p className="muted">No finished rounds yet.</p>
        ) : (
          <ul className="history">
            {progress.history.map((round, index) => (
              <li key={`${round.timestamp}-${round.mode}-${index}`}>
                <span>{MODE_LABEL[round.mode]}</span>
                <span>{round.score} / 5</span>
                <time dateTime={new Date(round.timestamp).toISOString()}>{formatWhen(round.timestamp)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className="credit">
        Piano samples from FluidR3_GM by Frank Wen, via midi-js-soundfonts (CC BY 3.0), trimmed for this demo.
      </footer>
    </>
  );
}
