"use client";

import { SlidersIcon } from "@/components/icons/sliders";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { defaultDiffOptions, type DiffOptions } from "./diff";

const labels: Record<keyof DiffOptions, string> = {
  ignoreKeyOrder: "Ignore key order",
  ignoreArrayOrder: "Ignore array order",
  ignoreCase: "Ignore case in strings",
  ignoreWhitespace: "Ignore whitespace in strings",
};

export function DiffOptionsMenu({ options, onChange }: { options: DiffOptions; onChange: (options: DiffOptions) => void }) {
  const changed = (Object.keys(labels) as (keyof DiffOptions)[]).filter((k) => options[k] !== defaultDiffOptions[k]).length;
  return (
    <Popover
      label="Compare options"
      align="start"
      trigger={({ open, toggle, id }) => (
        <Button variant="soft" size="xs" onClick={toggle} aria-expanded={open} aria-controls={id}>
          <SlidersIcon className="size-3" /> Options
          {changed > 0 && <span className="rounded-full bg-brand/20 px-1.5 text-[11px] text-brand">{changed}</span>}
        </Button>
      )}
    >
      <div className="flex flex-col gap-3">
        {(Object.keys(labels) as (keyof DiffOptions)[]).map((k) => (
          <Checkbox key={k} label={labels[k]} checked={options[k]} onChange={(checked) => onChange({ ...options, [k]: checked })} />
        ))}
        <p className="border-t border-border pt-2 text-[11px] leading-4 text-muted">Numbers are compared by value, so 1 and 1.0 are always equal.</p>
      </div>
    </Popover>
  );
}
