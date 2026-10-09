import { MagnifyingGlassPlusIcon } from "@/components/icons/magnifying-glass-plus";
import type { RepairChange } from "./repair";
import { ruleDot } from "./repair-tones";


const chip = "rounded bg-surface-3 px-1 font-mono text-[11px] text-heading";

export function RepairChangeItem({ change, onLocate }: { change: RepairChange; onLocate: (line: number) => void }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-4">
      <div className="flex min-w-0 items-start gap-4">
        <span aria-hidden className={`mt-1.5 size-2 shrink-0 rounded-full ${ruleDot[change.rule]}`} />
        <div className="min-w-0">
          <h4 className="text-sm leading-5 font-semibold text-heading">{change.title}</h4>
          <p className="flex flex-wrap items-center gap-x-1 text-xs leading-4 text-muted">
            <span>Line {change.line}:</span>
            {change.before !== undefined && change.after !== undefined ? (
              <>
                <code className={chip}>{change.before}</code> → <code className={chip}>{change.after}</code>
              </>
            ) : change.after !== undefined ? (
              <>
                Added <code className={chip}>{change.after}</code> {change.note}
              </>
            ) : change.before !== undefined ? (
              <>
                Removed <code className={chip}>{change.before}</code> {change.note}
              </>
            ) : (
              <span>{change.note}</span>
            )}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => change.outputLine && onLocate(change.outputLine)}
        disabled={!change.outputLine}
        aria-label={change.outputLine ? `Show line ${change.outputLine} of the result` : "Removed, so not in the result"}
        title={change.outputLine ? "Show in result" : "Removed, so not in the result"}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-border/40 hover:text-foreground disabled:opacity-30"
      >
        <MagnifyingGlassPlusIcon className="size-3.5" />
      </button>
    </li>
  );
}
