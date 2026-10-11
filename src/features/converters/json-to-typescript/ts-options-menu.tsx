"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { menuFieldClasses } from "@/components/ui/input-styles";
import { MenuSelect } from "@/components/ui/menu-select";
import { defaultTsOptions, type TsOptions } from "./json-to-typescript";

export function TsOptionsMenu({ options, onChange }: { options: TsOptions; onChange: (options: TsOptions) => void }) {
  const changed = (Object.keys(defaultTsOptions) as (keyof TsOptions)[]).filter((k) => options[k] !== defaultTsOptions[k]).length;
  const set = <K extends keyof TsOptions>(key: K, value: TsOptions[K]) => onChange({ ...options, [key]: value });
  const select = <K extends keyof TsOptions>(key: K, label: string, choices: [TsOptions[K], string][]) => (
    <label className="flex flex-col gap-1">
      <span className="text-heading">{label}</span>
      <MenuSelect value={String(options[key])} onChange={(e) => set(key, choices.find(([v]) => String(v) === e.target.value)![0])}>
        {choices.map(([v, l]) => (
          <option key={String(v)} value={String(v)}>
            {l}
          </option>
        ))}
      </MenuSelect>
    </label>
  );
  return (
    <Popover
      label="TypeScript options"
      trigger={({ open, toggle, id }) => (
        <Button variant={changed ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">TypeScript options</p>
        <label className="flex flex-col gap-1">
          <span className="text-heading">Root type name</span>
          <input className={menuFieldClasses} value={options.rootName} onChange={(e) => set("rootName", e.target.value)} placeholder="Root" spellCheck={false} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          {select("declaration", "Declaration", [
            ["interface", "Interface"],
            ["type", "Type alias"],
          ])}
          {select("arrayStyle", "Array style", [
            ["brackets", "T[]"],
            ["generic", "Array<T>"],
          ])}
          {select("nulls", "Null handling", [
            ["union", "T | null"],
            ["optional", "Optional (?:)"],
          ])}
          {select("unknownType", "Unknown values", [
            ["unknown", "unknown"],
            ["any", "any"],
          ])}
        </div>
        {select("nested", "Nested objects", [
          ["separate", "Separate types"],
          ["inline", "Inline"],
        ])}
        <Checkbox label="Export types" checked={options.exported} onChange={(on) => set("exported", on)} />
        <Checkbox label="Readonly properties" checked={options.readonly} onChange={(on) => set("readonly", on)} />
        <Checkbox label="All properties optional" checked={options.allOptional} onChange={(on) => set("allOptional", on)} />
        <Checkbox label="Sort properties" checked={options.sortProperties} onChange={(on) => set("sortProperties", on)} />
        <Checkbox label="Example comments" checked={options.comments} onChange={(on) => set("comments", on)} />
        <button
          type="button"
          onClick={() => onChange(defaultTsOptions)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
