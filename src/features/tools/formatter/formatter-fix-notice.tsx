import { Button } from "@/components/ui/button";
import type { RepairChange } from "@/features/tools/repair/repair";

// Lists what Auto-fix changed, so a repaired result never looks like the original input.
export function FormatterFixNotice({ changes, onUseFixed }: { changes: RepairChange[]; onUseFixed: () => void }) {
  const shown = changes.slice(0, 4);
  return (
    <div role="status" className="sticky top-0 z-10 flex items-start gap-3 border-b border-tint-amber/30 bg-tint-amber/10 px-4 py-3 backdrop-blur">
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5 font-semibold text-tint-amber">
          Auto-fixed {changes.length} {changes.length === 1 ? "issue" : "issues"} in your JSON
        </p>
        <ul className="mt-1 flex flex-col gap-0.5 text-xs leading-5 text-muted">
          {shown.map((c, i) => (
            <li key={i}>
              Line {c.line}: {c.title}
            </li>
          ))}
          {changes.length > shown.length && <li>…and {changes.length - shown.length} more</li>}
        </ul>
      </div>
      <Button variant="secondary" size="xs" onClick={onUseFixed} className="shrink-0" title="Replace the input with the fixed JSON">
        Use fixed JSON
      </Button>
    </div>
  );
}
