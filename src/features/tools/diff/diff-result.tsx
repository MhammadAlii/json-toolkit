"use client";

import { useMemo, useState } from "react";
import { CheckDoubleIcon } from "@/components/icons/check-double";
import { CopyIcon } from "@/components/icons/copy";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { diffToText, foldUnchanged, type LineDiffResult } from "./diff";
import { DiffCount } from "./diff-count";
import { DiffLineRow } from "./diff-line-row";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function DiffResult({ result, stale }: { result: LineDiffResult | null; stale: boolean }) {
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set());
  const { copy, copied } = useClipboard();
  const lines = result?.ok ? result.lines : null;
  const rows = useMemo(() => (lines ? foldUnchanged(lines, 3, expanded) : []), [lines, expanded]);
  const identical = !!lines && lines.every((l) => l.kind === "same");

  return (
    <section aria-label="Diff result" className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-6 py-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-base leading-6 font-bold text-heading">Diff Result</h2>
          {result?.ok && (
            <p className="flex flex-wrap items-center gap-3 text-[10px] leading-[15px] font-semibold text-muted">
              <DiffCount tone="bg-success" label={plural(result.counts.added, "Addition", "Additions")} />
              <DiffCount tone="bg-danger" label={plural(result.counts.removed, "Removal", "Removals")} />
              <DiffCount tone="bg-tint-amber" label={plural(result.counts.changed, "Change", "Changes")} />
            </p>
          )}
          {stale && <span className="text-[11px] font-semibold text-tint-amber">Inputs changed — compare again</span>}
        </div>
        <Button variant="soft" size="xs" onClick={() => lines && copy(diffToText(lines))} disabled={!lines || identical}>
          {copied ? <CheckDoubleIcon className="h-3 w-auto text-success" /> : <CopyIcon className="size-3" />}
          {copied ? "Copied!" : "Copy Diff"}
        </Button>
      </div>

      <div className="max-h-[560px] min-h-[120px] overflow-auto bg-code-bg">
        {!result ? (
          <p className="p-6 text-sm text-muted">Paste two JSON documents above and press Compare.</p>
        ) : !result.ok ? (
          <p role="alert" className="p-6 font-mono text-sm text-danger">
            {result.error}
          </p>
        ) : identical ? (
          <p role="status" className="flex items-center gap-2 p-6 text-sm text-success">
            <CheckDoubleIcon className="h-3 w-auto" /> No differences — both documents are equivalent.
          </p>
        ) : (
          <div className="w-max min-w-full">
            {rows.map((row) =>
              row.type === "line" ? (
                <DiffLineRow key={row.index} line={row.line} />
              ) : (
                <button
                  key={`gap-${row.from}`}
                  type="button"
                  onClick={() => setExpanded((s) => new Set(s).add(row.from))}
                  className="block w-full border-b border-border/40 bg-surface-3/60 py-1.5 pl-16 text-left text-xs text-brand hover:bg-border/30"
                >
                  Show {row.to - row.from} unchanged lines
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}
