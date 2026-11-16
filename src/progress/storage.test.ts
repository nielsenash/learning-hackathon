import { describe, expect, it } from "vitest";
import { emptyProgress, loadProgress, recordRound, saveProgress } from "./storage";

function memoryStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  };
}

describe("recordRound", () => {
  it("updates best score, walks the streak, and keeps the newest ten rounds", () => {
    const first = recordRound(emptyProgress(), "listen", [true, true, false, true, true], 1000);
    expect(first.listen).toEqual({ best: 4, streak: 2 });
    expect(first.sing).toEqual({ best: null, streak: 0 });
    expect(first.history).toEqual([{ mode: "listen", score: 4, timestamp: 1000 }]);

    const second = recordRound(first, "listen", [true, true, true, true, true], 2000);
    expect(second.listen).toEqual({ best: 5, streak: 7 });

    let progress = emptyProgress();
    for (let i = 0; i < 11; i += 1) {
      progress = recordRound(progress, "sing", [false, false, false, false, false], i);
    }
    expect(progress.history).toHaveLength(10);
    expect(progress.history[0].timestamp).toBe(10);
    expect(progress.history[9].timestamp).toBe(1);
    expect(progress.sing).toEqual({ best: 0, streak: 0 });
  });
});

describe("loadProgress", () => {
  it("round-trips saved progress", () => {
    const storage = memoryStorage();
    const progress = recordRound(emptyProgress(), "sing", [true, false, true, true, true], 50);
    saveProgress(progress, storage);
    expect(loadProgress(storage)).toEqual(progress);
  });

  it("falls back to empty progress when the stored value is corrupt", () => {
    expect(loadProgress(memoryStorage("{{"))).toEqual(emptyProgress());
    expect(loadProgress(memoryStorage(JSON.stringify({ listen: { best: 9, streak: 0 } })))).toEqual(
      emptyProgress(),
    );
    expect(loadProgress(memoryStorage(null))).toEqual(emptyProgress());
  });
});
