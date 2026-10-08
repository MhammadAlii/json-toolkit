"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

// Session storage holds about 5 MB; larger drafts just aren't kept across reloads.
const maxStored = 2_000_000;

function read(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    if (value && value.length <= maxStored) window.sessionStorage.setItem(key, value);
    else window.sessionStorage.removeItem(key);
  } catch {
    // Storage can be full or unavailable; the text stays in memory either way.
  }
}

const noSubscribe = () => () => {};

/** Text that survives a reload in the same tab. The live value is kept in state, never re-read from storage. */
export function useSessionDraft(key: string): [string, (next: string | ((prev: string) => string)) => void] {
  const stored = useSyncExternalStore(noSubscribe, () => read(key), () => null);
  const [local, setLocal] = useState<string | null>(null);

  const set = useCallback(
    (next: string | ((prev: string) => string)) =>
      setLocal((prev) => {
        const value = typeof next === "function" ? next(prev ?? read(key) ?? "") : next;
        write(key, value);
        return value;
      }),
    [key],
  );

  return [local ?? stored ?? "", set];
}
