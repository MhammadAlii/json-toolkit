import { CopyIconButton } from "@/components/ui/copy-icon-button";
import type { TimeFormat } from "./epoch";

// One point in time in every format, each with its own copy button.
export function EpochFormatsList({ formats, note }: { formats: TimeFormat[]; note: string }) {
  return (
    <div>
      <p className="border-b border-border px-4 py-3 text-xs text-muted">{note}</p>
      <dl className="divide-y divide-border/50">
        {formats.map((f) => (
          <div key={f.label} className="flex items-center gap-3 px-4 py-2.5">
            <dt className="w-36 shrink-0 text-xs text-muted">{f.label}</dt>
            <dd className="min-w-0 flex-1 font-mono text-sm break-all text-heading">{f.value}</dd>
            <CopyIconButton text={f.value} label={`Copy ${f.label}`} />
          </div>
        ))}
      </dl>
    </div>
  );
}
