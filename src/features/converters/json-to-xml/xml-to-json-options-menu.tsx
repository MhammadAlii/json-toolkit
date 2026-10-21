"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { MenuSelect } from "@/components/ui/menu-select";
import { defaultXmlToJsonOptions, type XmlToJsonOptions } from "./xml-to-json";

export function XmlToJsonOptionsMenu({ options, onChange }: { options: XmlToJsonOptions; onChange: (options: XmlToJsonOptions) => void }) {
  const changed = (Object.keys(defaultXmlToJsonOptions) as (keyof XmlToJsonOptions)[]).filter((k) => options[k] !== defaultXmlToJsonOptions[k]).length;
  const set = <K extends keyof XmlToJsonOptions>(key: K, value: XmlToJsonOptions[K]) => onChange({ ...options, [key]: value });
  const select = <K extends keyof XmlToJsonOptions>(key: K, label: string, choices: [XmlToJsonOptions[K], string][]) => (
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
        <div className="grid grid-cols-2 gap-2">
          {select("indent", "Indent", [
            [2, "2 spaces"],
            [4, "4 spaces"],
            ["tab", "Tabs"],
            ["minify", "Minified"],
          ])}
          {select("attributes", "Attributes", [
            ["prefixed", "@name keys"],
            ["merged", "Plain keys"],
            ["omit", "Leave out"],
          ])}
          {select("arrays", "Arrays", [
            ["repeated", "Repeated elements"],
            ["always", "Always"],
          ])}
          {select("values", "Values", [
            ["typed", "Numbers & booleans"],
            ["strings", "All strings"],
          ])}
          {select("cdata", "CDATA", [
            ["text", "Merge into text"],
            ["key", "Keep as #cdata"],
          ])}
          {select("namespaces", "Namespaces", [
            ["keep", "Keep prefixes"],
            ["strip", "Remove"],
          ])}
        </div>
        <Checkbox label="Keep the root element" checked={options.keepRoot} onChange={(on) => set("keepRoot", on)} />
        <Checkbox label="Sort keys" checked={options.sortKeys} onChange={(on) => set("sortKeys", on)} />
        <button
          type="button"
          onClick={() => onChange(defaultXmlToJsonOptions)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
