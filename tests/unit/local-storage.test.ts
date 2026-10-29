import { describe, it, expect } from "vitest";

/**
 * local-storage.ts depends on window.localStorage — tested via a minimal mock
 * (node environment). The versioned wrapper must never crash on malformed data.
 */
describe("safe localStorage wrapper", () => {
  it("returns fallback when storage is unavailable", async () => {
    const { readPreferences } = await import("@/lib/local-storage");
    const prefs = readPreferences();
    expect(prefs.bias).toBeNull();
    expect(prefs.bookmarks).toEqual([]);
    expect(prefs.onboarded).toBe(false);
  });

  it("survives malformed stored values", async () => {
    const store = new Map<string, string>();
    (globalThis as Record<string, unknown>).window = {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
        get keys() {
          return Array.from(store.keys());
        },
        key: (i: number) => Array.from(store.keys())[i] ?? null,
        get length() {
          return store.size;
        },
        clear: () => store.clear(),
      },
    };
    // malformed JSON
    store.set("monstiez.v1.prefs", "{not json");
    const mod = await import("@/lib/local-storage");
    expect(mod.readPreferences().bookmarks).toEqual([]);
    // wrong version
    store.set("monstiez.v1.prefs", JSON.stringify({ v: 0, data: { bias: "x" } }));
    expect(mod.readPreferences().bias).toBeNull();
    // valid write/read roundtrip
    mod.writePreferences({
      bias: "ahyeon",
      bookmarks: ["a"],
      watched: [],
      reminders: [],
      onboarded: true,
    });
    expect(mod.readPreferences().bias).toBe("ahyeon");
    expect(mod.readPreferences().onboarded).toBe(true);
  });
});
