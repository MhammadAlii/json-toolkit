"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { menuFieldClasses } from "@/components/ui/input-styles";
import { MenuSelect } from "@/components/ui/menu-select";
import { defaultSqlOptions, dialects, type SqlOptions } from "./json-to-sql";

export function SqlOptionsMenu({ options, keys, onChange }: { options: SqlOptions; keys: string[]; onChange: (options: SqlOptions) => void }) {
  const changed = (Object.keys(defaultSqlOptions) as (keyof SqlOptions)[]).filter((k) => options[k] !== defaultSqlOptions[k]).length;
  const set = <K extends keyof SqlOptions>(key: K, value: SqlOptions[K]) => onChange({ ...options, [key]: value });
  const select = <K extends keyof SqlOptions>(key: K, label: string, choices: [SqlOptions[K], string][]) => (
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
  const pkChoices = [...new Set([options.primaryKey, ...keys].filter(Boolean))];
  return (
    <Popover
      label="SQL options"
      trigger={({ open, toggle, id }) => (
        <Button variant={changed ? "accent" : "soft"} size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3 text-xs">
        <p className="font-bold tracking-[0.6px] text-muted uppercase">SQL options</p>
        <div className="grid grid-cols-2 gap-2">
          {select(
            "dialect",
            "Database",
            dialects.map((d) => [d.value, d.label]),
          )}
          {select("operation", "Operation", [
            ["insert", "INSERT"],
            ["upsert", "UPSERT"],
            ["update", "UPDATE"],
          ])}
          <label className="flex flex-col gap-1">
            <span className="text-heading">Table name</span>
            <input className={menuFieldClasses} value={options.table} onChange={(e) => set("table", e.target.value)} placeholder="users" spellCheck={false} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-heading">Primary key</span>
            <MenuSelect value={options.primaryKey} onChange={(e) => set("primaryKey", e.target.value)}>
              <option value="">None</option>
              {pkChoices.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </MenuSelect>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-heading">Rows per INSERT</span>
            <input className={menuFieldClasses} type="number" min={1} max={10000} value={options.batchSize} onChange={(e) => set("batchSize", Math.max(1, Math.min(10000, Number(e.target.value) || 1)))} />
          </label>
          {select("quoting", "Quote names", [
            ["auto", "When needed"],
            ["always", "Always"],
          ])}
          {select("nested", "Nested objects", [
            ["json", "JSON column"],
            ["flatten", "Flatten"],
            ["ignore", "Leave out"],
          ])}
          {select("arrays", "Arrays", [
            ["json", "JSON column"],
            ["ignore", "Leave out"],
          ])}
        </div>
        {select("booleans", "Booleans", [
          ["keywords", "TRUE / FALSE"],
          ["numbers", "1 / 0"],
        ])}
        <Checkbox label="Include CREATE TABLE" checked={options.createTable} onChange={(on) => set("createTable", on)} />
        <Checkbox label="Wrap in a transaction" checked={options.transaction} onChange={(on) => set("transaction", on)} />
        <Checkbox label="Ignore duplicate rows" checked={options.ignoreDuplicates} onChange={(on) => set("ignoreDuplicates", on)} />
        <button
          type="button"
          onClick={() => onChange(defaultSqlOptions)}
          disabled={changed === 0}
          className="self-start border-t border-border pt-2 font-semibold text-brand disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </Popover>
  );
}
