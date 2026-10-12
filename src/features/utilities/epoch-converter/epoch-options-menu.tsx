"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import { MenuSelect } from "@/components/ui/menu-select";
import { defaultEpochOptions, type EpochOptions } from "./epoch";

export function EpochOptionsMenu({ options, onChange }: { options: EpochOptions; onChange: (options: EpochOptions) => void }) {
  const changed = (Object.keys(defaultEpochOptions) as (keyof EpochOptions)[]).filter((k) => options[k] !== defaultEpochOptions[k]).length;
  return (
    <Popover
      label="Time options"
      trigger={({ open, toggle, id }) => (
        <Button variant={changed ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">Time options</p>
        <label className="flex flex-col gap-1">
          <span className="text-heading">Timestamp unit</span>
          <MenuSelect value={options.unit} onChange={(e) => onChange({ ...options, unit: e.target.value as EpochOptions["unit"] })}>
            <option value="auto">Detect from length</option>
            <option value="s">Seconds</option>
            <option value="ms">Milliseconds</option>
            <option value="us">Microseconds</option>
            <option value="ns">Nanoseconds</option>
          </MenuSelect>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-heading">Dates without a time zone</span>
          <MenuSelect value={options.zone} onChange={(e) => onChange({ ...options, zone: e.target.value as EpochOptions["zone"] })}>
            <option value="local">Your time zone</option>
            <option value="utc">UTC</option>
          </MenuSelect>
        </label>
        <button
          type="button"
          onClick={() => onChange(defaultEpochOptions)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
