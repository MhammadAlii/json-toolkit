"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { MenuSelect } from "@/components/ui/menu-select";
import { defaultUrlOptions, type UrlOptions } from "./url";

export function UrlOptionsMenu({ encoding, options, onChange }: { encoding: boolean; options: UrlOptions; onChange: (options: UrlOptions) => void }) {
  // Only the options that apply to the current direction count as changed.
  const keys: (keyof UrlOptions)[] = encoding ? ["mode", "perLine"] : ["plusAsSpace", "perLine"];
  const changed = keys.filter((k) => options[k] !== defaultUrlOptions[k]).length;
  const set = <K extends keyof UrlOptions>(key: K, value: UrlOptions[K]) => onChange({ ...options, [key]: value });
  return (
    <Popover
      label="URL options"
      trigger={({ open, toggle, id }) => (
        <Button variant={changed ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">{encoding ? "Encode options" : "Decode options"}</p>
        {encoding ? (
          <label className="flex flex-col gap-1">
            <span className="text-heading">Encode as</span>
            <MenuSelect value={options.mode} onChange={(e) => set("mode", e.target.value as UrlOptions["mode"])}>
              <option value="component">Query value (all reserved characters)</option>
              <option value="uri">Full URL (keep : / ? # &amp; =)</option>
              <option value="form">Form data (spaces as +)</option>
            </MenuSelect>
          </label>
        ) : (
          <Checkbox label="Treat + as a space" checked={options.plusAsSpace} onChange={(on) => set("plusAsSpace", on)} />
        )}
        <Checkbox label={encoding ? "Encode each line separately" : "Decode each line separately"} checked={options.perLine} onChange={(on) => set("perLine", on)} />
        <button
          type="button"
          onClick={() => onChange(defaultUrlOptions)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
