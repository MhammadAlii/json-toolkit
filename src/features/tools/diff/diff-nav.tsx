import { ChevronRightIcon } from "@/components/icons/chevron-right";
import { Kbd } from "@/components/ui/kbd";

export function DiffNav({ current, total, path, onMove }: { current: number; total: number; path: string; onMove: (step: 1 | -1) => void }) {
  const button = "flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted hover:text-foreground disabled:opacity-40";
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background/40 px-6 py-2 text-xs text-muted">
      <div className="flex items-center gap-1.5">
        <button type="button" className={button} onClick={() => onMove(-1)} disabled={total === 0} aria-label="Previous change" aria-keyshortcuts="p">
          <ChevronRightIcon className="h-2.5 w-auto rotate-180" />
        </button>
        <button type="button" className={button} onClick={() => onMove(1)} disabled={total === 0} aria-label="Next change" aria-keyshortcuts="n">
          <ChevronRightIcon className="h-2.5 w-auto" />
        </button>
      </div>
      <span role="status" className="font-semibold text-heading">
        {current === -1 ? `${total} ${total === 1 ? "change" : "changes"}` : `Change ${current + 1} of ${total}`}
      </span>
      {path && <code className="min-w-0 truncate font-mono text-brand">{path}</code>}
      <span className="ml-auto hidden items-center gap-1 sm:flex">
        <Kbd tone="solid">n</Kbd> / <Kbd tone="solid">p</Kbd> to jump
      </span>
    </div>
  );
}
