"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons/chevron-right";
import { ListOrderedIcon } from "@/components/icons/list-ordered";
import type { RepairChange } from "./repair";
import { RepairChangeItem } from "./repair-change-item";

const collapsed = 6;
// Thousands of rows freeze the page; beyond this the log just says how many more there are.
const maxShown = 500;

export function RepairAuditLog({ changes, onLocate }: { changes: RepairChange[]; onLocate: (line: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const shown = changes.slice(0, expanded ? maxShown : collapsed);
  return (
    <section aria-label="Audit log" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-3 text-lg leading-7 font-bold text-heading">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <ListOrderedIcon className="h-3.5 w-auto" />
          </span>
          Audit Log: {changes.length.toLocaleString()} {changes.length === 1 ? "Change" : "Changes"} Applied
        </h3>
        {changes.length > collapsed && (
          <button type="button" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded} className="flex items-center gap-2 text-sm font-semibold text-brand">
            {expanded ? "Collapse" : "Expand All"}
            <ChevronRightIcon className={`h-2.5 w-auto transition-transform ${expanded ? "-rotate-90" : "rotate-90"}`} />
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-3">
        {shown.map((c, i) => (
          <RepairChangeItem key={i} change={c} onLocate={onLocate} />
        ))}
      </ul>
      {!expanded && changes.length > collapsed && <p className="-mt-3 text-xs text-muted">and {(changes.length - collapsed).toLocaleString()} more</p>}
      {expanded && changes.length > maxShown && <p className="-mt-3 text-xs text-muted">and {(changes.length - maxShown).toLocaleString()} more not listed</p>}
    </section>
  );
}
