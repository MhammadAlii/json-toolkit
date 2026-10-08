"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

// JSON value persisted in localStorage and shared by every component using the same key.
export function useStoredState<T>(key: string, fallback: T): [T, (value: T | null) => void] {
  const raw = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    () => read(key),
    () => null,
  );

  let value = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }

  const setValue = useCallback(
    (next: T | null) => {
      try {
        if (next === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage can be unavailable (private mode); the change just won't persist.
      }
      listeners.forEach((l) => l());
    },
    [key],
  );

  return [value, setValue];
}
