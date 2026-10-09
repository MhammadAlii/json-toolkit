import type { RepairResult } from "./repair";

export function RepairStatusPill({ result }: { result: RepairResult }) {
  const [dot, text, label] =
    result.status === "empty"
      ? ["bg-muted/50", "text-muted", "Waiting for input"]
      : result.status === "blocked"
        ? ["bg-tint-amber", "text-tint-amber", "Needs a disabled repair"]
        : result.changes.length === 0
          ? ["bg-success", "text-success", "Already valid JSON"]
          : ["bg-success", "text-success", `Repaired · ${result.changes.length.toLocaleString()} ${result.changes.length === 1 ? "change" : "changes"}`];
  return (
    <span role="status" className={`inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold ${text}`}>
      <span aria-hidden className={`size-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
