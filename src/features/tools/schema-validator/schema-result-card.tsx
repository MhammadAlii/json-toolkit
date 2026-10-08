import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { ShieldCheckIcon } from "@/components/icons/shield-check";
import type { SchemaCheck } from "./schema-validator";
import { SchemaViolationItem } from "./schema-violation-item";

const tones = {
  idle: { card: "border-border bg-surface", tile: "bg-border/40 text-muted" },
  failed: { card: "border-danger/30 bg-danger/5", tile: "bg-danger/15 text-danger" },
  warning: { card: "border-tint-amber/30 bg-tint-amber/5", tile: "bg-tint-amber/15 text-tint-amber" },
  passed: { card: "border-success/30 bg-success/5", tile: "bg-success/15 text-success" },
};

function summary(check: SchemaCheck | null): { tone: keyof typeof tones; title: string; detail: string } {
  if (!check) return { tone: "idle", title: "Ready to validate", detail: "Press Validate to check the target JSON against the schema." };
  switch (check.status) {
    case "passed":
      return { tone: "passed", title: "Validation Passed", detail: "The target JSON matches the schema." };
    case "invalid-json":
      return { tone: "failed", title: check.side === "data" ? "Target JSON is invalid" : "Schema isn't valid JSON", detail: check.error };
    case "invalid-schema":
      return { tone: "warning", title: "Schema problem", detail: check.error };
    case "failed": {
      const n = check.violations.length;
      return { tone: "failed", title: "Validation Failed", detail: `Found ${check.truncated ? `more than ${n}` : n} schema violation${n === 1 ? "" : "s"}` };
    }
  }
}

export function SchemaResultCard({ check, stale }: { check: SchemaCheck | null; stale: boolean }) {
  const { tone, title, detail } = summary(check);
  const Icon = tone === "passed" ? ShieldCheckIcon : ShieldAlertIcon;
  return (
    <section aria-label="Validation result" aria-live="polite" className={`flex min-h-0 flex-col gap-6 rounded-xl border p-6 ${tones[tone].card}`}>
      <div className="flex items-start gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tones[tone].tile}`}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base leading-6 font-bold text-heading">{title}</h2>
          <p className="text-[11px] leading-[15px] break-words text-muted">{detail}</p>
          {stale && <p className="pt-1 text-[11px] font-semibold text-tint-amber">Inputs changed — validate again</p>}
        </div>
      </div>
      {check?.status === "failed" && (
        <ol className="-mr-2 flex max-h-[360px] flex-col gap-4 overflow-auto pr-2">
          {check.violations.map((v, i) => (
            <SchemaViolationItem key={i} index={i} violation={v} />
          ))}
        </ol>
      )}
    </section>
  );
}
