"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { MenuSelect } from "@/components/ui/menu-select";
import { defaultJsonOutputOptions, type JsonOutputOptions } from "./json-output";

// Indent and key sorting for converters that produce JSON. A converter with settings of its own passes
// them as children and its full `defaults`, so they're counted and reset with the rest.
export function JsonOutputOptionsMenu<T extends JsonOutputOptions>({
  options,
  onChange,
  defaults = defaultJsonOutputOptions as T,
  children,
}: {
  options: T;
  onChange: (options: T) => void;
  defaults?: T;
  children?: React.ReactNode;
}) {
  const changed = (Object.keys(defaults) as (keyof T)[]).filter((k) => options[k] !== defaults[k]).length;
  return (
    <Popover
      label="JSON options"
      trigger={({ open, toggle, id }) => (
        <Button variant={changed ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">JSON options</p>
        <label className="flex flex-col gap-1">
          <span className="text-heading">Indent</span>
          <MenuSelect
            value={options.indent}
            onChange={(e) => onChange({ ...options, indent: (["tab", "minify"].includes(e.target.value) ? e.target.value : Number(e.target.value)) as JsonOutputOptions["indent"] })}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value="tab">Tabs</option>
            <option value="minify">Minified</option>
          </MenuSelect>
        </label>
        {children}
        <Checkbox label="Sort keys" checked={options.sortKeys} onChange={(on) => onChange({ ...options, sortKeys: on })} />
        <button
          type="button"
          onClick={() => onChange(defaults)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
