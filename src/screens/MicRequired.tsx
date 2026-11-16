type Props = {
  onHome: () => void;
};

export function MicRequired({ onHome }: Props) {
  return (
    <section>
      <p className="eyebrow">Sing and match</p>
      <h1>Microphone needed</h1>
      <p>
        Sing and match records about two seconds through the microphone and scores the pitch in this browser.
        Nothing is uploaded. Allow microphone access to play this mode.
      </p>
      <p>Listen and identify still works without a microphone.</p>
      <button type="button" className="primary" onClick={onHome}>
        Back home
      </button>
    </section>
  );
}
