import { useState } from "react";
import { resumeAudio } from "./audio/player";
import { loadProgress, recordRound, saveProgress, type Mode, type Progress } from "./progress/storage";
import { Home } from "./screens/Home";
import { ListenRound } from "./screens/ListenRound";
import { MicRequired } from "./screens/MicRequired";
import { SingRound } from "./screens/SingRound";
import { Summary } from "./screens/Summary";

type Screen =
  | { name: "home" }
  | { name: "listen" }
  | { name: "sing" }
  | { name: "mic-required" }
  | { name: "summary"; mode: Mode; score: number };

export function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [roundId, setRoundId] = useState(0);
  const [startingSing, setStartingSing] = useState(false);

  function goHome() {
    setScreen({ name: "home" });
  }

  async function startListen() {
    await resumeAudio();
    setRoundId((id) => id + 1);
    setScreen({ name: "listen" });
  }

  async function startSing() {
    setStartingSing(true);
    try {
      await resumeAudio();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      stream.getTracks().forEach((track) => track.stop());
      setRoundId((id) => id + 1);
      setScreen({ name: "sing" });
    } catch {
      setScreen({ name: "mic-required" });
    } finally {
      setStartingSing(false);
    }
  }

  function finishRound(mode: Mode, hits: boolean[]) {
    setProgress((current) => {
      const next = recordRound(current, mode, hits);
      saveProgress(next);
      return next;
    });
    setScreen({ name: "summary", mode, score: hits.filter(Boolean).length });
  }

  return (
    <div className="app">
      {screen.name === "home" && (
        <Home
          progress={progress}
          startingSing={startingSing}
          onStartListen={() => void startListen()}
          onStartSing={() => void startSing()}
        />
      )}
      {screen.name === "listen" && (
        <ListenRound key={roundId} onExit={goHome} onComplete={(hits) => finishRound("listen", hits)} />
      )}
      {screen.name === "sing" && (
        <SingRound
          key={roundId}
          onExit={goHome}
          onMicDenied={() => setScreen({ name: "mic-required" })}
          onComplete={(hits) => finishRound("sing", hits)}
        />
      )}
      {screen.name === "mic-required" && <MicRequired onHome={goHome} />}
      {screen.name === "summary" && (
        <Summary
          mode={screen.mode}
          score={screen.score}
          busy={startingSing}
          onHome={goHome}
          onAgain={() => {
            if (screen.mode === "listen") void startListen();
            else void startSing();
          }}
        />
      )}
    </div>
  );
}
