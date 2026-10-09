"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { allRules, repairRules, type RepairOptions } from "./repair";

export function RepairFixMenu({ options, onChange }: { options: RepairOptions; onChange: (options: RepairOptions) => void }) {
  const off = repairRules.filter((r) => !options[r.id]).length;
  return (
    <Popover
      label="Fix options"
      trigger={({ open, toggle, id }) => (
        <Button variant="soft" size="tiny" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="h-[11px] w-auto" /> Fix options
          {off > 0 && <span className="rounded-full bg-tint-amber/20 px-1.5 text-tint-amber">{off} off</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3">
        <p className="text-[11px] leading-4 font-bold tracking-[0.6px] text-muted uppercase">What to fix</p>
        <ul className="flex flex-col gap-3">
          {repairRules.map((r) => (
            <li key={r.id} className="flex flex-col gap-0.5">
              <Checkbox label={r.label} checked={options[r.id]} onChange={(on) => onChange({ ...options, [r.id]: on })} />
              <span className="pl-6 text-[11px] leading-4 text-muted">{r.hint}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onChange(allRules)}
          disabled={off === 0}
          className="self-start border-t border-border pt-2 text-xs font-semibold text-brand disabled:opacity-40"
        >
          Turn all on
        </button>
      </div>
    </Popover>
  );
}
