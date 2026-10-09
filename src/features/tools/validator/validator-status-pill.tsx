import type { Validation } from "./validator";

const tones = {
  empty: { dot: "bg-muted/50", text: "text-muted", label: "Waiting for input" },
  valid: { dot: "bg-success", text: "text-success", label: "Valid JSON" },
  invalid: { dot: "bg-danger", text: "text-danger", label: "Invalid JSON" },
};

export function ValidatorStatusPill({ validation }: { validation: Validation }) {
  const tone = tones[validation.status];
  return (
    <span role="status" className={`inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold ${tone.text}`}>
      <span aria-hidden className={`size-2 rounded-full ${tone.dot}`} />
      {validation.status === "invalid" ? `${tone.label} · line ${validation.error.line}` : tone.label}
    </span>
  );
}
