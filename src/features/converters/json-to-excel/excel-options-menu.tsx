"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { menuFieldClasses } from "@/components/ui/input-styles";
import { MenuSelect } from "@/components/ui/menu-select";
import { defaultExcelOptions, type ExcelOptions } from "./json-to-excel";

export function ExcelOptionsMenu({ options, onChange }: { options: ExcelOptions; onChange: (options: ExcelOptions) => void }) {
  const changed = (Object.keys(defaultExcelOptions) as (keyof ExcelOptions)[]).filter((k) => options[k] !== defaultExcelOptions[k]).length;
  const set = <K extends keyof ExcelOptions>(key: K, value: ExcelOptions[K]) => onChange({ ...options, [key]: value });
  return (
    <Popover
      label="Excel options"
      trigger={({ open, toggle, id }) => (
        <Button variant={changed ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">Excel options</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-heading">Sheet name</span>
            <input className={menuFieldClasses} value={options.sheetName} onChange={(e) => set("sheetName", e.target.value)} placeholder="Sheet1" maxLength={31} spellCheck={false} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-heading">Arrays</span>
            <MenuSelect value={options.arrays} onChange={(e) => set("arrays", e.target.value as ExcelOptions["arrays"])}>
              <option value="json">Keep as JSON</option>
              <option value="join">Join with commas</option>
              <option value="columns">One column each</option>
            </MenuSelect>
          </label>
        </div>
        <Checkbox label="Header row" checked={options.headers} onChange={(on) => set("headers", on)} />
        <Checkbox label="Freeze header row" checked={options.freezeHeader} onChange={(on) => set("freezeHeader", on)} />
        <Checkbox label="Add filters to headers" checked={options.autoFilter} onChange={(on) => set("autoFilter", on)} />
        <Checkbox label="Convert ISO dates to Excel dates" checked={options.dates} onChange={(on) => set("dates", on)} />
        <Checkbox label="Flatten nested objects" checked={options.flatten} onChange={(on) => set("flatten", on)} />
        <Checkbox label="Sort columns" checked={options.sortColumns} onChange={(on) => set("sortColumns", on)} />
        <button
          type="button"
          onClick={() => onChange(defaultExcelOptions)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
