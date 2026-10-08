"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { FileCsvIcon } from "@/components/icons/file-csv";
import { FilterIcon } from "@/components/icons/filter";
import { Button } from "@/components/ui/button";
import { toCsv } from "@/core/json/csv";
import type { PathSegment } from "@/core/json/path";
import { buildTable, filterRows, projectRows } from "@/core/json/table";
import { useDownload } from "@/hooks/use-download";
import { JsonExplorerLayout } from "./json-explorer-layout";
import { JsonTableColumnsMenu } from "./json-table-columns-menu";
import { JsonTableView } from "./json-table-view";

// Rendering every row of a large array freezes the page, so rows are revealed in pages.
const pageSize = 200;

export function JsonTableExplorer({ value }: { value: unknown }) {
  const table = useMemo(() => buildTable(value), [value]);
  const [filter, setFilter] = useState("");
  const [hidden, setHidden] = useState<string[]>([]);
  const [limit, setLimit] = useState(pageSize);
  const [selected, setSelected] = useState<PathSegment[]>([]);
  const download = useDownload();
  const deferredFilter = useDeferredValue(filter);

  const columns = useMemo(() => table?.columns.filter((c) => !hidden.includes(c)) ?? [], [table, hidden]);
  const rows = useMemo(() => (table ? filterRows(table.rows, deferredFilter, columns) : []), [table, deferredFilter, columns]);

  if (!table) return <p className="p-4 text-sm text-muted">A single value can&apos;t be shown as a table.</p>;

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-background/30 px-3 py-2">
      <label className="relative min-w-[100px] flex-1">
        <span className="sr-only">Filter rows</span>
        <FilterIcon className="pointer-events-none absolute top-1/2 left-2.5 size-[11px] -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={filter}
          onChange={(e) => (setFilter(e.target.value), setLimit(pageSize))}
          placeholder="Filter rows..."
          className="w-full rounded-md border border-border bg-background py-1.5 pr-2.5 pl-7 text-xs leading-4 text-heading outline-none placeholder:text-muted/60 focus:border-brand/60"
        />
      </label>
      {table.kind === "records" && <JsonTableColumnsMenu columns={table.columns} hidden={hidden} onChange={setHidden} />}
      <Button
        variant="accent"
        size="tiny"
        disabled={rows.length === 0 || columns.length === 0}
        onClick={() => download(toCsv(projectRows(rows, columns)).csv, "table.csv", "text/csv")}
      >
        <FileCsvIcon className="h-[11px] w-auto" />
        <span className="sr-only @md/output:not-sr-only">Export CSV</span>
      </Button>
    </div>
  );

  return (
    <JsonExplorerLayout value={value} selected={selected} toolbar={toolbar}>
      <JsonTableView table={table} rows={rows.slice(0, limit)} columns={columns} selectedPath={selected} onSelect={setSelected} />
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-muted">
        <span role="status">
          {rows.length === table.rows.length ? `${rows.length} rows` : `${rows.length} of ${table.rows.length} rows`}
          {rows.length === 0 && deferredFilter && <> match &ldquo;{deferredFilter}&rdquo;</>}
        </span>
        {rows.length > limit && (
          <Button variant="soft" size="tiny" onClick={() => setLimit((l) => l + pageSize)}>
            Show {Math.min(pageSize, rows.length - limit)} more
          </Button>
        )}
      </div>
    </JsonExplorerLayout>
  );
}
