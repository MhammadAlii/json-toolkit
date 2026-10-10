"use client";

import { PaletteIcon } from "@/components/icons/palette";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import type { JsonColorKey, JsonColors } from "@/hooks/use-json-colors";
import { defaultJsonColors as defaults, jsonColorThemes, type JsonColorTheme } from "./json-color-themes";

const keys: JsonColorKey[] = ["key", "string", "number", "boolean", "null", "punct"];

// The Toolkit theme is the defaults, so no customisation counts as choosing it.
const isActive = (theme: JsonColorTheme, colors: JsonColors) =>
  keys.every((k) => (colors[k] ?? defaults[k]).toLowerCase() === theme.colors[k].toLowerCase());

const rows: { key: JsonColorKey; label: string; sample: string }[] = [
  { key: "key", label: "Keys", sample: '"name"' },
  { key: "string", label: "Strings", sample: '"Ada"' },
  { key: "number", label: "Numbers", sample: "1284" },
  { key: "boolean", label: "Booleans", sample: "true" },
  { key: "null", label: "Null", sample: "null" },
  { key: "punct", label: "Brackets & punctuation", sample: "{ } [ ] , :" },
];

export function JsonColorPicker({
  colors,
  onChange,
  onApply,
  onReset,
}: {
  colors: JsonColors;
  onChange: (key: JsonColorKey, value: string) => void;
  onApply: (colors: JsonColors) => void;
  onReset: () => void;
}) {
  const customized = Object.keys(colors).length > 0;
  return (
    <Popover
      label="Output colors"
      trigger={({ open, toggle, id }) => (
        <Button variant={open || customized ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id} aria-label="Output colors">
          <PaletteIcon className="size-[11px]" />
        </Button>
      )}
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs leading-4 font-bold tracking-[0.6px] text-muted uppercase">Themes</p>
        <ul className="grid grid-cols-2 gap-1.5">
          {jsonColorThemes.map((t) => {
            const active = isActive(t, colors);
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onApply(t.id === "toolkit" ? {} : t.colors)}
                  aria-pressed={active}
                  className={`flex w-full flex-col gap-1.5 rounded-md border px-2 py-1.5 text-left transition-colors ${
                    active ? "border-brand/60 bg-brand/10" : "border-border bg-background hover:border-brand/40"
                  }`}
                >
                  <span className="truncate text-[11px] leading-4 font-semibold text-heading">{t.name}</span>
                  <span aria-hidden className="flex gap-1">
                    {(["key", "string", "number", "boolean", "null"] as const).map((k) => (
                      <span key={k} className="size-2.5 rounded-full" style={{ background: t.colors[k] }} />
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-border pt-3 text-xs leading-4 font-bold tracking-[0.6px] text-muted uppercase">Customize</p>
        <ul className="flex flex-col gap-2">
          {rows.map((r) => {
            const value = colors[r.key] ?? defaults[r.key];
            const inputId = `json-color-${r.key}`;
            return (
              <li key={r.key} className="flex items-center justify-between gap-3">
                <label htmlFor={inputId} className="flex min-w-0 flex-col">
                  <span className="text-xs leading-4 text-heading">{r.label}</span>
                  <span className="truncate font-mono text-xs leading-4" style={{ color: value }}>
                    {r.sample}
                  </span>
                </label>
                <input
                  id={inputId}
                  type="color"
                  value={value}
                  onChange={(e) => onChange(r.key, e.target.value)}
                  className="h-7 w-10 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5"
                />
              </li>
            );
          })}
        </ul>
        <Button variant="soft" size="tiny" onClick={onReset} disabled={!customized} className="self-end">
          Reset to defaults
        </Button>
      </div>
    </Popover>
  );
}
