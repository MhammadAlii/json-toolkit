"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import type { Delimiter } from "@/core/json/csv";
import { defaultCsvConverterOptions, type CsvConverterOptions } from "./json-to-csv";

const field = "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-heading outline-none focus:border-brand/60";

export function CsvOptionsMenu({ options, onChange }: { options: CsvConverterOptions; onChange: (options: CsvConverterOptions) => void }) {
  const changed = (Object.keys(defaultCsvConverterOptions) as (keyof CsvConverterOptions)[]).filter((k) => options[k] !== defaultCsvConverterOptions[k]).length;
  const set = <K extends keyof CsvConverterOptions>(key: K, value: CsvConverterOptions[K]) => onChange({ ...options, [key]: value });
  return (
    <Popover
      label="CSV options"
      trigger={({ open, toggle, id }) => (
        <Button variant={changed ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">CSV options</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-heading">Delimiter</span>
            <select className={field} value={options.delimiter} onChange={(e) => set("delimiter", e.target.value as Delimiter)}>
              <option value=",">Comma</option>
              <option value=";">Semicolon</option>
              <option value={"\t"}>Tab</option>
              <option value="|">Pipe</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-heading">Quotes</span>
            <select className={field} value={options.quoting} onChange={(e) => set("quoting", e.target.value as CsvConverterOptions["quoting"])}>
              <option value="needed">When needed</option>
              <option value="all">All cells</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-heading">Arrays</span>
            <select className={field} value={options.arrays} onChange={(e) => set("arrays", e.target.value as CsvConverterOptions["arrays"])}>
              <option value="json">Keep as JSON</option>
              <option value="join">Join with commas</option>
              <option value="columns">One column each</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-heading">Null values</span>
            <select className={field} value={options.nulls} onChange={(e) => set("nulls", e.target.value as CsvConverterOptions["nulls"])}>
              <option value="empty">Empty cell</option>
              <option value="null">null</option>
            </select>
          </label>
        </div>
        <Checkbox label="Include headers" checked={options.headers} onChange={(on) => set("headers", on)} />
        <Checkbox label="Flatten nested objects" checked={options.flatten} onChange={(on) => set("flatten", on)} />
        <Checkbox label="Sort columns" checked={options.sortColumns} onChange={(on) => set("sortColumns", on)} />
        <Checkbox label="BOM for Excel (UTF-8)" checked={options.bom} onChange={(on) => set("bom", on)} />
        <button
          type="button"
          onClick={() => onChange(defaultCsvConverterOptions)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
