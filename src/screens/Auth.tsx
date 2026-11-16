import { useState } from "react";
import { createAccount, login, type Account } from "../progress/accounts";

type Props = {
  onAuthenticated: (account: Account) => void;
};

export function Auth({ onAuthenticated }: Props) {
  const [creating, setCreating] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (creating) {
        if (name.trim().length < 2) throw new Error("Please enter your name.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        onAuthenticated(await createAccount(name, email, password));
      } else {
        onAuthenticated(await login(email, password));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to continue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">Your practice space</p>
      <h1>{creating ? "Create your account" : "Welcome back"}</h1>
      <p className="lede">
        {creating
          ? "Save your scores and see your personal progress across sessions."
          : "Log in to continue practicing and view your statistics."}
      </p>
      <form className="auth-form" onSubmit={(event) => void submit(event)}>
        {creating && (
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
          </label>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete={creating ? "new-password" : "current-password"}
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Please wait…" : creating ? "Create account" : "Log in"}
        </button>
      </form>
      <button type="button" className="ghost" onClick={() => { setCreating(!creating); setError(""); }}>
        {creating ? "Already have an account? Log in" : "Need an account? Create one"}
      </button>
      <p className="muted auth-note">Accounts and scores are stored only in this browser for this demo.</p>
    </section>
  );
}
