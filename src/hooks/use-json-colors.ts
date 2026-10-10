"use client";

import type { JsonTokenType } from "@/core/json/tokenize";
import { useStoredState } from "./use-stored-state";

export type JsonColorKey = Exclude<JsonTokenType, "space">;

export type JsonColors = Partial<Record<JsonColorKey, string>>;

export function useJsonColors() {
  const [colors, setColors] = useStoredState<JsonColors>("json-toolkit:output-colors", {});
  const style = Object.fromEntries(Object.entries(colors).map(([k, v]) => [`--json-${k}`, v])) as React.CSSProperties;
  return {
    colors,
    style,
    setColor: (key: JsonColorKey, value: string) => setColors({ ...colors, [key]: value }),
    /** Replaces every colour at once, e.g. with a theme; an empty object means the defaults. */
    setAll: (next: JsonColors) => setColors(Object.keys(next).length ? next : null),
    reset: () => setColors(null),
  };
}
