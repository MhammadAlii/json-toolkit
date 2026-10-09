import { Card } from "@/components/ui/card";
import { repairRules, type RepairChange, type RepairOptions, type RepairRule } from "./repair";
import { ruleDot } from "./repair-tones";

export function RepairRulesCard({ options, changes, onToggle }: { options: RepairOptions; changes: RepairChange[]; onToggle: (rule: RepairRule) => void }) {
  return (
    <Card as="section" tone="surface" aria-label="Repair intelligence" className="flex flex-col gap-5 p-6">
      <h2 className="text-xs leading-4 font-bold tracking-[0.6px] text-heading uppercase">Repair Intelligence</h2>
      <ul>
        {repairRules.map((r) => {
          const count = changes.filter((c) => c.rule === r.id).length;
          const on = options[r.id];
          return (
            <li key={r.id} className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm leading-5 text-heading">
                  <span aria-hidden className={`size-2 rounded-full ${ruleDot[r.id]}`} />
                  {r.label}
                  {count > 0 && <span className="text-xs text-muted">· {count.toLocaleString()}</span>}
                </p>
                <p className="pl-4 text-[11px] leading-4 text-muted">{r.hint}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${r.label} repairs`}
                onClick={() => onToggle(r.id)}
                className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${on ? "bg-success/15 text-success" : "bg-border/40 text-muted"}`}
              >
                {on ? "Enabled" : "Disabled"}
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
