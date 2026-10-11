"use client";

import { SearchIcon } from "@/components/icons/search";
import { XmarkIcon } from "@/components/icons/xmark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MenuSelect } from "@/components/ui/menu-select";
import { searchModes, type SearchMode, type SearchOptions } from "./deep-search";
import { DeepSearchFiltersMenu } from "./deep-search-filters-menu";

const toggles: { key: "caseSensitive" | "exact" | "regex"; label: string; title: string }[] = [
  { key: "caseSensitive", label: "Aa", title: "Case sensitive" },
  { key: "exact", label: "Exact", title: "Exact match: the whole key or value must match" },
  { key: "regex", label: ".*", title: "Regular expression" },
];

export function DeepSearchBar({
  query,
  options,
  error,
  onQueryChange,
  onOptionsChange,
}: {
  query: string;
  options: SearchOptions;
  error?: string;
  onQueryChange: (query: string) => void;
  onOptionsChange: (options: SearchOptions) => void;
}) {
  return (
    <Card as="section" tone="surface" aria-label="Search" className="flex flex-col gap-2 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search query</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search for keys, values or full paths…"
            aria-invalid={!!error}
            spellCheck={false}
            className={`w-full rounded-lg border bg-background py-3 pr-10 pl-10 font-mono text-sm text-heading outline-none placeholder:font-sans placeholder:text-muted/60 ${
              error ? "border-danger/70" : "border-border focus:border-brand/60"
            }`}
          />
          {query && (
            <button type="button" onClick={() => onQueryChange("")} aria-label="Clear search" className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-muted hover:text-foreground">
              <XmarkIcon className="h-3 w-auto" />
            </button>
          )}
        </label>
        <label className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.6px] text-muted uppercase">Search mode</span>
          <MenuSelect size="md" value={options.mode} onChange={(e) => onOptionsChange({ ...options, mode: e.target.value as SearchMode })}>
            {searchModes.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </MenuSelect>
        </label>
        <div className="flex items-center gap-1.5" role="group" aria-label="Matching">
          {toggles.map((t) => (
            <Button
              key={t.key}
              variant={options[t.key] ? "accent" : "soft"}
              size="xs"
              onClick={() => onOptionsChange({ ...options, [t.key]: !options[t.key] })}
              aria-pressed={options[t.key]}
              title={t.title}
              className="min-w-9 font-mono"
            >
              {t.label}
            </Button>
          ))}
        </div>
        <DeepSearchFiltersMenu options={options} onChange={onOptionsChange} />
      </div>
      {error && (
        <p role="alert" className="font-mono text-xs text-danger">
          {error}
        </p>
      )}
    </Card>
  );
}
