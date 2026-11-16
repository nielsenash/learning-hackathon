# Pitch Recognition

A small React web app for a hackathon demo. It trains two skills: identifying a played note by ear, and matching a target note with the voice. Both modes use a fixed set of piano notes. Scores stay in the browser.

## Goal

Show both modes working end to end in one sitting:

1. The user hears a bundled piano sample and picks the matching note.
2. The app shows a target note, the user records a short hum or sung note, and the app scores how close that pitch was.

## Users

A demo audience with no assumed music training. The first session is the whole product: a short practice round, not a curriculum.

## Note set

- Chromatic notes from C4 to B4 (12 notes).
- Display names use scientific pitch notation (`C4`, `C#4`, `D4`, …).
- Reference pitch is A4 = 440 Hz.
- Playback and scoring use the same note set.

## Modes

### Listen and identify

1. The app plays one bundled piano sample.
2. The user may replay it.
3. The user selects one note from C4–B4.
4. The app reveals the correct note and whether the choice matched.
5. The user can start the next item. A round is 5 items.

### Sing and match

1. The app shows a target note and can play its piano sample as a reference.
2. The user records about 2 seconds of humming or singing through the microphone.
3. The app finds the steadiest pitch in the clip and compares it to the target.
4. The app shows the detected note, the error in cents, and a pass or fail.
5. A round is 5 items.

The user can switch modes from the home screen. A round in progress can be abandoned; partial results are not saved.

## Accuracy

- Pitch detection runs in the browser on the recorded clip. No audio is uploaded.
- The score uses the closest stable pitch, ignoring the noisy start and end of the clip.
- Error is the distance from the target frequency, in cents.
- **Pass:** absolute error of 50 cents or less (within a quarter tone).
- **Fail:** anything farther, or no stable pitch detected.
- The result also names the nearest note in the C4–B4 set, so a miss still teaches which note was sung.

## Samples

- One piano recording per note, C4–B4, bundled with the app.
- Samples are short (about 1–2 seconds), normalized to a similar loudness, and licensed for redistribution.
- The listen mode plays these files. The sing mode uses the same files only as an optional reference tone.

## Accounts and progress

Stored in `localStorage` only:

- A local account with name, email, and a hashed password.
- Best score (correct answers out of 5) for each mode.
- Current streak: consecutive passed sing items, and consecutive correct listen items.
- A short history of the last 10 finished rounds (mode, score, timestamp).

Users must create an account or log in before practicing. Progress is scoped to the signed-in account. There is no server or sync across browsers. Clearing site data resets accounts and progress.

## Screens

1. **Account.** Create an account or log in.
2. **Home.** Greet the signed-in user, show personal statistics plus best score and streak for each mode, and offer Start.
3. **Listen round.** Replay button, 12 note buttons, then correct or incorrect with the right answer.
4. **Sing round.** Target note, Play reference, Record, then cents, detected note, and pass or fail.
5. **Round summary.** Score out of 5 and a control to go home or play again.

Microphone permission is requested only when the user starts a sing round. If permission is denied, the sing mode explains that a microphone is required and the listen mode stays available.

## Stack

- React with Vite.
- Static hosting. No backend.
- Web Audio API for playback and for capturing the microphone clip.
- A small in-browser pitch detector (autocorrelation or a similar library) to estimate the fundamental frequency.
- `localStorage` for accounts, scores, and streaks.

## Demo script

1. Open the app and start a listen round.
2. Play a sample, pick a note, and see correct or incorrect.
3. Finish or exit and confirm the best score on the home screen.
4. Start a sing round, allow the microphone, record a hum of the target note, and see cents plus pass or fail.
5. Reload the page and confirm the saved score is still there.

## Done when

- Both rounds can be completed with the 12 bundled piano notes.
- Listen answers are checked against the sample that was played.
- A sing clip produces a cents error and a pass or fail against the 50-cent line.
- Best scores and streaks survive a reload.
- The app runs locally with `npm install` and `npm run dev`.

## Out of scope

- Uploaded audio, and melodies or intervals.
- Live pitch display while singing.
- More than one octave, instrument choice, or difficulty levels.
- A backend, a database, or audio stored on a server.
