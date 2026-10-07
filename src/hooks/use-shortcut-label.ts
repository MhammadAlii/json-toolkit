"use client";

import { useSyncExternalStore } from "react";

// Server snapshot avoids a hydration mismatch.
export function useShortcutLabel(key = "K") {
  return useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? `⌘${key}` : `Ctrl ${key}`),
    () => `⌘${key}`,
  );
}
