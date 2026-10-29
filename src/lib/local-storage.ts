/**
 * Safe localStorage wrapper with versioning — malformed/old values never crash the app.
 * (playbook Law 3 + brief §6: safe parsing/versioning)
 */
export const STORAGE_VERSION = 1;

const PREFIX = "monstiez.v1.";

function available(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function readJson<T>(key: string, fallback: T): T {
  if (!available()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw) as { v: number; data: unknown };
    if (typeof parsed !== "object" || parsed === null || parsed.v !== STORAGE_VERSION) {
      return fallback;
    }
    return parsed.data as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, data: unknown): void {
  if (!available()) return;
  try {
    window.localStorage.setItem(
      PREFIX + key,
      JSON.stringify({ v: STORAGE_VERSION, data }),
    );
  } catch {
    /* quota/private mode — preferences degrade gracefully */
  }
}
/* ---------- typed preference helpers ---------- */

export interface Preferences {
  bias: string | null;
  bookmarks: string[];
  watched: string[];
  reminders: string[];
  onboarded: boolean;
}

const DEFAULT_PREFS: Preferences = {
  bias: null,
  bookmarks: [],
  watched: [],
  reminders: [],
  onboarded: false,
};

/**
 * Stable snapshot cache — useSyncExternalStore requires getSnapshot to return
 * the SAME reference until the underlying data changes (otherwise React loops).
 */
let snapshotCache: Preferences | null = null;

export function invalidatePreferencesCache(): void {
  snapshotCache = null;
}

export function readPreferences(): Preferences {
  if (snapshotCache) return snapshotCache;
  snapshotCache = { ...DEFAULT_PREFS, ...readJson<Partial<Preferences>>("prefs", {}) };
  return snapshotCache;
}

export function writePreferences(prefs: Preferences): void {
  writeJson("prefs", prefs);
  snapshotCache = prefs; // keep the cached snapshot coherent
}

export function updatePreferences(
  mutate: (p: Preferences) => Preferences,
): Preferences {
  const next = mutate(readPreferences());
  writePreferences(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PREFS_EVENT));
  }
  return next;
}

export const PREFS_EVENT = "monstiez:prefs-changed";

export function resetPreferences(): void {
  if (!available()) return;
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
    invalidatePreferencesCache();
  } catch {
    /* noop */
  }
}
