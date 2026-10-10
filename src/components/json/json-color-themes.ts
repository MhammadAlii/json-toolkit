import type { JsonColorKey } from "@/hooks/use-json-colors";

export type JsonColorTheme = { id: string; name: string; colors: Record<JsonColorKey, string> };

// Keep in sync with the --json-* defaults in app/globals.css.
export const defaultJsonColors: Record<JsonColorKey, string> = {
  key: "#7c5cff",
  string: "#34d399",
  number: "#fbbf24",
  boolean: "#fbbf24",
  null: "#94a3b8",
  punct: "#5a6577",
};

// Palettes inspired by popular editor themes, all tuned to read on the dark output background.
export const jsonColorThemes: JsonColorTheme[] = [
  { id: "toolkit", name: "Toolkit", colors: defaultJsonColors },
  { id: "dracula", name: "Dracula", colors: { key: "#8be9fd", string: "#f1fa8c", number: "#bd93f9", boolean: "#ff79c6", null: "#bd93f9", punct: "#6272a4" } },
  { id: "monokai", name: "Monokai", colors: { key: "#f92672", string: "#e6db74", number: "#ae81ff", boolean: "#66d9ef", null: "#ae81ff", punct: "#75715e" } },
  { id: "one-dark", name: "One Dark", colors: { key: "#e06c75", string: "#98c379", number: "#d19a66", boolean: "#56b6c2", null: "#c678dd", punct: "#5c6370" } },
  { id: "github-dark", name: "GitHub Dark", colors: { key: "#7ee787", string: "#a5d6ff", number: "#79c0ff", boolean: "#ff7b72", null: "#79c0ff", punct: "#8b949e" } },
  { id: "nord", name: "Nord", colors: { key: "#88c0d0", string: "#a3be8c", number: "#b48ead", boolean: "#81a1c1", null: "#81a1c1", punct: "#616e88" } },
  { id: "solarized", name: "Solarized Dark", colors: { key: "#268bd2", string: "#2aa198", number: "#d33682", boolean: "#cb4b16", null: "#6c71c4", punct: "#657b83" } },
  { id: "high-contrast", name: "High Contrast", colors: { key: "#ffffff", string: "#7dff7d", number: "#ffd866", boolean: "#ff9e64", null: "#d0d0d0", punct: "#a0a0a0" } },
];
