"use client";

import { Popover } from "@/components/ui/popover";

export function XmlRenamesMenu({ renamed }: { renamed: { from: string; to: string }[] }) {
  return (
    <Popover
      label="Renamed keys"
      trigger={({ open, toggle, id }) => (
        <button type="button" onClick={toggle} aria-expanded={open} aria-controls={id} className="rounded-md border border-tint-amber/40 px-2.5 py-1 text-xs font-semibold text-tint-amber hover:bg-tint-amber/10">
          View changes
        </button>
      )}
    >
      <ul className="flex max-h-64 flex-col gap-1.5 overflow-auto font-mono text-xs">
        {renamed.map((r) => (
          <li key={r.from} className="flex items-center gap-2">
            <span className="truncate text-muted">{JSON.stringify(r.from)}</span>→<span className="truncate text-heading">{r.to}</span>
          </li>
        ))}
      </ul>
    </Popover>
  );
}
