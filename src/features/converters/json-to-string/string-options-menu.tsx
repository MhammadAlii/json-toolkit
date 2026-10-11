"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { MenuSelect } from "@/components/ui/menu-select";
import { defaultStringOptions, type StringOptions } from "./json-to-string";

export function StringOptionsMenu({ options, onChange }: { options: StringOptions; onChange: (options: StringOptions) => void }) {
  const changed = (Object.keys(defaultStringOptions) as (keyof StringOptions)[]).filter((k) => options[k] !== defaultStringOptions[k]).length;
  return (
    <Popover
      label="String options"
      trigger={({ open, toggle, id }) => (
        <Button variant={changed ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">String options</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-heading">JSON layout</span>
            <MenuSelect value={options.layout} onChange={(e) => onChange({ ...options, layout: e.target.value as StringOptions["layout"] })}>
              <option value="minify">Minified</option>
              <option value="pretty">Pretty</option>
              <option value="keep">As typed</option>
            </MenuSelect>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-heading">Quotes</span>
            <MenuSelect value={options.quotes} onChange={(e) => onChange({ ...options, quotes: e.target.value as StringOptions["quotes"] })}>
              <option value="double">Double &quot;</option>
              <option value="single">Single &apos;</option>
              <option value="none">None</option>
            </MenuSelect>
          </label>
        </div>
        <Checkbox label="Escape non-ASCII (\uXXXX)" checked={options.escapeUnicode} onChange={(on) => onChange({ ...options, escapeUnicode: on })} />
        <button
          type="button"
          onClick={() => onChange(defaultStringOptions)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
