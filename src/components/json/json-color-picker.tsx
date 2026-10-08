"use client";

import { PaletteIcon } from "@/components/icons/palette";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import type { JsonColorKey, JsonColors } from "@/hooks/use-json-colors";

// Keep in sync with the --json-* defaults in app/globals.css.
const defaults: Record<JsonColorKey, string> = {
  key: "#7c5cff",
  string: "#34d399",
  number: "#fbbf24",
  boolean: "#fbbf24",
  null: "#94a3b8",
  punct: "#5a6577",
};

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
  onReset,
}: {
  colors: JsonColors;
  onChange: (key: JsonColorKey, value: string) => void;
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
        <p className="text-xs leading-4 font-bold tracking-[0.6px] text-muted uppercase">Output colors</p>
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
