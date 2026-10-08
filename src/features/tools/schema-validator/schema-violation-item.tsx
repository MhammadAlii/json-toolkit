import type { SchemaErrorCategory } from "@/core/json/schema";
import { violationPath, type Violation } from "./schema-validator";

const categoryTone: Record<SchemaErrorCategory, string> = {
  "Type Mismatch": "text-danger",
  Required: "text-danger",
  "Additional Property": "text-tint-orange",
  Format: "text-tint-amber",
  Value: "text-tint-amber",
  Composition: "text-tint-violet",
  Constraint: "text-tint-amber",
};

export function SchemaViolationItem({ index, violation }: { index: number; violation: Violation }) {
  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-[10px] leading-[15px] font-bold tracking-[0.6px] uppercase">
        <span className="text-muted">Error #{index + 1}</span>
        <span className={categoryTone[violation.category]}>{violation.category}</span>
      </div>
      <p className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-3 text-sm leading-5 text-muted">
        <code className="font-mono text-heading">{violationPath(violation.path)}</code>: {violation.message}
        {violation.line !== undefined && <span className="ml-1 text-xs whitespace-nowrap text-muted/60">(line {violation.line})</span>}
      </p>
    </li>
  );
}
