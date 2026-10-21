"use client";

import { useMemo } from "react";
import { useStoredState } from "./use-stored-state";

// Options saved in localStorage, merged over the defaults so options added later start at their default.
// Stored values are re-read each render, so the result is memoised on their JSON to stay referentially stable.
export function useStoredOptions<T extends object>(key: string, defaults: T): [T, (value: T | null) => void] {
  const [stored, setStored] = useStoredState<Partial<T>>(key, defaults);
  const json = JSON.stringify(stored);
  const options = useMemo<T>(() => ({ ...defaults, ...(JSON.parse(json) as Partial<T>) }), [defaults, json]);
  return [options, setStored];
}
