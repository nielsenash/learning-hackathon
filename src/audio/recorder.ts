export type RecordedClip = {
  samples: Float32Array;
  sampleRate: number;
};

function concatSamples(chunks: Float32Array[], length: number): Float32Array {
  const out = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    const remaining = length - offset;
    if (remaining <= 0) break;
    const take = Math.min(remaining, chunk.length);
    out.set(chunk.subarray(0, take), offset);
    offset += take;
  }
  return out;
}

export async function recordClip(seconds = 2): Promise<RecordedClip> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });
  const context = new AudioContext();
  try {
    if (context.state !== "running") await context.resume();
    await context.audioWorklet.addModule(new URL("./capture-processor.js", import.meta.url));
    const source = context.createMediaStreamSource(stream);
    const node = new AudioWorkletNode(context, "capture-processor");
    const mute = context.createGain();
    mute.gain.value = 0;
    source.connect(node);
    node.connect(mute);
    mute.connect(context.destination);

    const target = Math.ceil(context.sampleRate * seconds);
    const chunks: Float32Array[] = [];
    let total = 0;
    const samples = await new Promise<Float32Array>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        reject(new Error("Recording timed out"));
      }, (seconds + 3) * 1000);
      node.port.onmessage = (event: MessageEvent) => {
        const data: unknown = event.data;
        if (!(data instanceof Float32Array)) return;
        chunks.push(data);
        total += data.length;
        if (total >= target) {
          window.clearTimeout(timer);
          node.port.onmessage = null;
          resolve(concatSamples(chunks, target));
        }
      };
    });
    return { samples, sampleRate: context.sampleRate };
  } finally {
    stream.getTracks().forEach((track) => track.stop());
    await context.close();
  }
}
