"use client";

import { MenuSelect } from "@/components/ui/menu-select";

// A labelled select inside an options menu, for values of any type (numbers, strings, booleans).
export function OptionSelect<V>({ label, value, choices, onChange }: { label: string; value: V; choices: [V, string][]; onChange: (value: V) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-heading">{label}</span>
      <MenuSelect value={String(value)} onChange={(e) => onChange(choices.find(([v]) => String(v) === e.target.value)![0])}>
        {choices.map(([v, l]) => (
          <option key={String(v)} value={String(v)}>
            {l}
          </option>
        ))}
      </MenuSelect>
    </label>
  );
}
