"use client";

import { FilterIcon } from "@/components/icons/filter";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import { defaultSearchOptions, type SearchOptions, type ValueTypeFilter } from "./deep-search";

const types: { value: ValueTypeFilter; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "null", label: "Null" },
  { value: "object", label: "Object" },
  { value: "array", label: "Array" },
];

const field = "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-heading outline-none focus:border-brand/60";

export function DeepSearchFiltersMenu({ options, onChange }: { options: SearchOptions; onChange: (options: SearchOptions) => void }) {
  const active = [options.valueType !== "any", options.maxDepth > 0, options.maxResults > 0].filter(Boolean).length;
  return (
    <Popover
      label="Search filters"
      trigger={({ open, toggle, id }) => (
        <Button variant={active ? "accent" : "soft"} size="xs" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <FilterIcon className="h-3 w-auto" /> Filters
          {active > 0 && <span className="rounded-full bg-brand/20 px-1.5">{active}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">Filters</p>
        <label className="flex flex-col gap-1">
          <span className="text-heading">Value type</span>
          <select className={field} value={options.valueType} onChange={(e) => onChange({ ...options, valueType: e.target.value as ValueTypeFilter })}>
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-heading">Search depth</span>
          <select className={field} value={options.maxDepth} onChange={(e) => onChange({ ...options, maxDepth: Number(e.target.value) })}>
            <option value={0}>Unlimited</option>
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "level" : "levels"}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-heading">Max results</span>
          <select className={field} value={options.maxResults} onChange={(e) => onChange({ ...options, maxResults: Number(e.target.value) })}>
            <option value={0}>Unlimited</option>
            {[10, 50, 100, 500, 1000].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => onChange({ ...options, valueType: defaultSearchOptions.valueType, maxDepth: 0, maxResults: 0 })}
          disabled={active === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset filters
        </button>
      </div>
    </Popover>
  );
}
