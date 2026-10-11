"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { menuFieldClasses } from "@/components/ui/input-styles";
import { MenuSelect } from "@/components/ui/menu-select";
import { defaultXmlOptions, type XmlOptions } from "./json-to-xml";

export function XmlOptionsMenu({ options, onChange }: { options: XmlOptions; onChange: (options: XmlOptions) => void }) {
  const changed = (Object.keys(defaultXmlOptions) as (keyof XmlOptions)[]).filter((k) => options[k] !== defaultXmlOptions[k]).length;
  const set = <K extends keyof XmlOptions>(key: K, value: XmlOptions[K]) => onChange({ ...options, [key]: value });
  const select = <K extends keyof XmlOptions>(key: K, label: string, choices: [XmlOptions[K], string][]) => (
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
      label="XML options"
      trigger={({ open, toggle, id }) => (
        <Button variant={changed ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">XML options</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-heading">Root element</span>
            <input className={menuFieldClasses} value={options.rootName} onChange={(e) => set("rootName", e.target.value)} placeholder="root" spellCheck={false} />
          </label>
          {select("indent", "Indent", [
            [2, "2 spaces"],
            [4, "4 spaces"],
            [0, "None"],
          ])}
          {select("arrays", "Arrays", [
            ["repeat", "Repeated elements"],
            ["wrap", "Wrapped <item>"],
          ])}
          {select("nulls", "Null values", [
            ["empty", "Empty element"],
            ["omit", "Leave out"],
            ["nil", "xsi:nil"],
          ])}
          {select("booleans", "Booleans", [
            ["words", "true / false"],
            ["numbers", "1 / 0"],
          ])}
        </div>
        {select("attributes", "Attributes", [
          ["elements", "Everything as elements"],
          ["attributes", "Plain values as attributes"],
          ["prefixed", "@keys as attributes, #text as text"],
        ])}
        <Checkbox label="Sort keys" checked={options.sortKeys} onChange={(on) => set("sortKeys", on)} />
        <Checkbox label="Self-closing empty tags" checked={options.selfClosing} onChange={(on) => set("selfClosing", on)} />
        <Checkbox label="XML declaration" checked={options.declaration} onChange={(on) => set("declaration", on)} />
        <Checkbox label="Leave out the root element" checked={options.omitRoot} onChange={(on) => set("omitRoot", on)} />
        <button
          type="button"
          onClick={() => onChange(defaultXmlOptions)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
