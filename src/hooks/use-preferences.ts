"use client";

import { useSyncExternalStore } from "react";
import {
  readPreferences,
  writePreferences,
  invalidatePreferencesCache,
  PREFS_EVENT,
  type Preferences,
} from "@/lib/local-storage";

export const PREFS_DEFAULTS: Preferences = {
  bias: null,
  bookmarks: [],
  watched: [],
  reminders: [],
  onboarded: false,
};

function subscribe(cb: () => void) {
  // invalidate the cached snapshot before notifying — external changes
  // (other tabs, resets) must be visible to the next getSnapshot()
  const onChange = () => {
    invalidatePreferencesCache();
    cb();
  };
  window.addEventListener(PREFS_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PREFS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Preferences {
  return readPreferences();
}

function getServerSnapshot(): Preferences {
  return PREFS_DEFAULTS;
}

/**
 * Reactive localStorage preferences — no setState-in-effect, no hydration
 * mismatch (server snapshot = defaults). Any writer dispatches the change event.
 */
export function useLocalPreferences(): readonly [
  Preferences,
  (mutate: (p: Preferences) => Preferences) => void,
] {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const update = (mutate: (p: Preferences) => Preferences) => {
    writePreferences(mutate(readPreferences()));
    window.dispatchEvent(new Event(PREFS_EVENT));
  };
  return [prefs, update] as const;
}

/** True only after hydration — for browser-only computed values (e.g. countdowns). */
export function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Online/offline status as an external store. */
export function useOnline(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}
