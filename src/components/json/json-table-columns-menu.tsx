"use client";

import { TableColumnsIcon } from "@/components/icons/table-columns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";

export function JsonTableColumnsMenu({
  columns,
  hidden,
  onChange,
}: {
  columns: string[];
  hidden: string[];
  onChange: (hidden: string[]) => void;
}) {
  return (
    <Popover
      label="Visible columns"
      trigger={({ open, toggle, id }) => (
        <Button variant="soft" size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <TableColumnsIcon className="h-[11px] w-auto" />
          <span className="sr-only @md/output:not-sr-only">Columns</span>
          {hidden.length > 0 && <span className="text-muted">({columns.length - hidden.length}/{columns.length})</span>}
        </Button>
      )}
    >
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs font-bold tracking-[0.6px] text-muted uppercase">Columns</span>
        <button type="button" onClick={() => onChange([])} disabled={hidden.length === 0} className="text-xs font-semibold text-brand disabled:opacity-40">
          Show all
        </button>
      </div>
      <div className="flex max-h-64 flex-col gap-2 overflow-auto">
        {columns.map((c) => (
          <Checkbox
            key={c}
            label={c}
            checked={!hidden.includes(c)}
            onChange={(checked) => onChange(checked ? hidden.filter((h) => h !== c) : [...hidden, c])}
          />
        ))}
      </div>
    </Popover>
  );
}
