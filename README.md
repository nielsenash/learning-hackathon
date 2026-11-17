# Pitch Recognition

A small React app for practicing pitch by ear. It is built as a short hackathon demo: one practice round, not a full curriculum. No music training is required.

There are two modes, both using the same twelve piano pitch classes from C to B (A4 = 440 Hz):

- **Listen and identify.** The app plays a bundled piano sample. You pick the note you heard. A round is five items.
- **Sing and match.** The app shows a target note. You hum or sing for about two seconds. The app estimates the steadiest pitch in the clip, shows the error in cents, and marks a pass or fail. A pass is within 50 cents of the target (a quarter tone). A round is five items.

Audio stays in the browser. Pitch detection runs locally, and nothing is uploaded. Users can create a local account, log in, and see personal best scores, accuracy, streaks, and a short history of the last ten finished rounds. Account data and progress are saved in `localStorage`; there is no server or cross-device sync. Clearing site data resets accounts and progress.

The next training set is selected by a small online learning model. It estimates each note's miss rate from the user's saved attempts, then adds an exploration bonus for notes with less evidence. Listen and sing performance are learned separately, so each mode adapts to the user's needs without sending data to a server.

The microphone is requested only when a sing round starts. If permission is denied, sing mode explains that a microphone is required, and listen mode still works.

## Run locally

You need [Node.js](https://nodejs.org/) (current LTS is enough) and npm.

```bash
npm install
npm run dev
```

Vite prints a local URL, usually `http://localhost:5173`. Open it in the browser. For sing mode, allow microphone access when the browser asks.

To check a production build:

```bash
npm run build
npm run preview
```

The app is static. There is no backend to start.
