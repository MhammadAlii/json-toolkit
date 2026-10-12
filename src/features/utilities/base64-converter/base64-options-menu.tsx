"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { defaultBase64Options, type Base64Options } from "./base64";

export function Base64OptionsMenu({ options, onChange }: { options: Base64Options; onChange: (options: Base64Options) => void }) {
  const changed = (Object.keys(defaultBase64Options) as (keyof Base64Options)[]).filter((k) => options[k] !== defaultBase64Options[k]).length;
  const set = <K extends keyof Base64Options>(key: K, value: Base64Options[K]) => onChange({ ...options, [key]: value });
  return (
    <Popover
      label="Base64 options"
      trigger={({ open, toggle, id }) => (
        <Button variant={changed ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">Encode options</p>
        <Checkbox label="URL-safe (- and _)" checked={options.urlSafe} onChange={(on) => set("urlSafe", on)} />
        <Checkbox label="Keep = padding" checked={options.padding} onChange={(on) => set("padding", on)} />
        <Checkbox label="Wrap lines at 76 characters" checked={options.wrap} onChange={(on) => set("wrap", on)} />
        <Checkbox label="Data URI (data:…;base64,)" checked={options.dataUri} onChange={(on) => set("dataUri", on)} />
        <button
          type="button"
          onClick={() => onChange(defaultBase64Options)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
