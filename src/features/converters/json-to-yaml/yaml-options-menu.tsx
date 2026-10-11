"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { MenuSelect } from "@/components/ui/menu-select";
import { defaultYamlOptions, type YamlOptions } from "./json-to-yaml";

export function YamlOptionsMenu({ options, onChange }: { options: YamlOptions; onChange: (options: YamlOptions) => void }) {
  const changed = (Object.keys(defaultYamlOptions) as (keyof YamlOptions)[]).filter((k) => options[k] !== defaultYamlOptions[k]).length;
  return (
    <Popover
      label="YAML options"
      trigger={({ open, toggle, id }) => (
        <Button variant={changed ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">YAML options</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-heading">Indent</span>
            <MenuSelect value={options.indent} onChange={(e) => onChange({ ...options, indent: Number(e.target.value) as 2 | 4 })}>
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </MenuSelect>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-heading">YAML style</span>
            <MenuSelect value={options.style} onChange={(e) => onChange({ ...options, style: e.target.value as YamlOptions["style"] })}>
              <option value="block">Standard</option>
              <option value="flow">Flow (inline)</option>
            </MenuSelect>
          </label>
        </div>
        <Checkbox label="Sort keys" checked={options.sortKeys} onChange={(on) => onChange({ ...options, sortKeys: on })} />
        <Checkbox label="Quote all strings" checked={options.quoteStrings} onChange={(on) => onChange({ ...options, quoteStrings: on })} />
        <button
          type="button"
          onClick={() => onChange(defaultYamlOptions)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
