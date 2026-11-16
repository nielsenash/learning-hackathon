import { sampleUrl, type NoteName } from "./notes";

let context: AudioContext | null = null;
const cache = new Map<NoteName, Promise<AudioBuffer>>();
let current: AudioBufferSourceNode | null = null;
let playToken = 0;

function audioContext(): AudioContext {
  if (!context) context = new AudioContext();
  return context;
}

export async function resumeAudio(): Promise<void> {
  const ctx = audioContext();
  if (ctx.state !== "running") await ctx.resume();
}

export function stopPlayback(): void {
  playToken += 1;
  if (!current) return;
  try {
    current.stop();
  } catch {
    // The buffer already finished.
  }
  current = null;
}

async function loadBuffer(note: NoteName, ctx: AudioContext): Promise<AudioBuffer> {
  const existing = cache.get(note);
  if (existing) return existing;
  const pending = fetch(sampleUrl(note)).then(async (response) => {
    if (!response.ok) throw new Error(`Missing sample for ${note}`);
    const data = await response.arrayBuffer();
    return ctx.decodeAudioData(data);
  });
  cache.set(note, pending);
  try {
    return await pending;
  } catch (error) {
    cache.delete(note);
    throw error;
  }
}

export async function playNote(note: NoteName): Promise<void> {
  const token = ++playToken;
  const ctx = audioContext();
  if (ctx.state !== "running") await ctx.resume();
  const buffer = await loadBuffer(note, ctx);
  if (token !== playToken) return;
  if (current) {
    try {
      current.stop();
    } catch {
      // The buffer already finished.
    }
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.onended = () => {
    if (current === source) current = null;
  };
  source.start();
  current = source;
}
