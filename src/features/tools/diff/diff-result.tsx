"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckDoubleIcon } from "@/components/icons/check-double";
import { CopyIcon } from "@/components/icons/copy";
import { DownloadIcon } from "@/components/icons/download";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { formatPath } from "@/core/json/path";
import { useClipboard } from "@/hooks/use-clipboard";
import { useDownload } from "@/hooks/use-download";
import { toJsonPatch, type CompareResult } from "./diff";
import { DiffCount } from "./diff-count";
import { DiffGapRow } from "./diff-gap-row";
import { DiffLineRow } from "./diff-line-row";
import { DiffNav } from "./diff-nav";
import { DiffSplitRow } from "./diff-split-row";
import { diffToText, foldUnchanged, hunks, splitRows } from "./diff-view";

export type DiffViewMode = "unified" | "split";

const views = [
  { value: "unified", label: "Unified" },
  { value: "split", label: "Split" },
] as const;

// Rendering tens of thousands of changed rows at once freezes the page, so they're revealed in pages.
const pageSize = 500;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export function DiffResult({
  result,
  pending,
  lossy,
  view,
  onViewChange,
  options,
}: {
  result: CompareResult;
  pending: boolean;
  lossy: boolean;
  view: DiffViewMode;
  onViewChange: (view: DiffViewMode) => void;
  /** The compare options menu, shown with the result's other controls. */
  options: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set());
  const [limit, setLimit] = useState(pageSize);
  const [current, setCurrent] = useState(-1);
  const scroller = useRef<HTMLDivElement>(null);
  const { copy, copied } = useClipboard();
  const download = useDownload();

  const lines = result.ok ? result.lines : null;
  const changeHunks = useMemo(() => (lines ? hunks(lines) : []), [lines]);
  const rows = useMemo(() => (lines ? foldUnchanged(lines, 3, expanded) : []), [lines, expanded]);
  const split = useMemo(() => (view === "split" ? splitRows(rows) : []), [view, rows]);
  const visibleCount = view === "split" ? split.length : rows.length;
  const identical = !!lines && changeHunks.length === 0;
  const hunk = changeHunks[current];
  const isActive = (index: number) => !!hunk && index >= hunk.start && index <= hunk.end;

  const move = (step: 1 | -1) => {
    if (changeHunks.length === 0) return;
    const next = current === -1 ? (step === 1 ? 0 : changeHunks.length - 1) : (current + step + changeHunks.length) % changeHunks.length;
    const target = changeHunks[next].start;
    const position = (view === "split" ? split : rows).findIndex((r) => r.type !== "gap" && r.index >= target);
    if (position >= limit) setLimit(position + pageSize);
    setCurrent(next);
  };

  useEffect(() => {
    if (!hunk || !scroller.current) return;
    const el = scroller.current.querySelector<HTMLElement>(`[data-index="${hunk.start}"]`);
    if (el) scroller.current.scrollTo({ top: el.offsetTop - scroller.current.clientHeight / 3, behavior: "smooth" });
  }, [hunk, limit]);

  const moveRef = useRef(move);
  useEffect(() => {
    moveRef.current = move;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === "n") moveRef.current(1);
      else if (e.key === "p") moveRef.current(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section
      aria-label="Diff result"
      aria-busy={pending}
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-2 px-6 py-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-base leading-6 font-bold text-heading">Diff Result</h2>
          {result.ok && (
            <p className="flex flex-wrap items-center gap-3 text-[10px] leading-[15px] font-semibold text-muted">
              <DiffCount tone="bg-success" label={plural(result.counts.added, "Addition", "Additions")} />
              <DiffCount tone="bg-danger" label={plural(result.counts.removed, "Removal", "Removals")} />
              <DiffCount tone="bg-tint-amber" label={plural(result.counts.changed, "Change", "Changes")} />
            </p>
          )}
          {pending && <span className="text-[11px] font-semibold text-brand">Comparing…</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {options}
          <SegmentedControl label="Diff layout" options={views} value={view} onChange={onViewChange} />
          <Button
            variant="soft"
            size="xs"
            onClick={() => result.ok && download(JSON.stringify(toJsonPatch(result.changes), null, 2), "json-patch.json")}
            disabled={!result.ok || identical || lossy}
            title={lossy ? "Turn off the ignore options to export a patch that reproduces B exactly" : "Download the changes as an RFC 6902 JSON Patch"}
          >
            <DownloadIcon className="size-3" /> JSON Patch
          </Button>
          <Button variant="soft" size="xs" onClick={() => lines && copy(diffToText(lines))} disabled={!lines || identical}>
            {copied ? <CheckDoubleIcon className="h-3 w-auto text-success" /> : <CopyIcon className="size-3" />}
            {copied ? "Copied!" : "Copy Diff"}
          </Button>
        </div>
      </div>

      {result.ok && !identical && (
        <DiffNav current={current} total={changeHunks.length} path={hunk ? formatPath(lines![hunk.start].path) : ""} onMove={move} />
      )}
      {result.ok && result.approximate && (
        <p className="border-b border-border bg-tint-amber/10 px-6 py-2 text-xs text-tint-amber">
          These documents differ heavily, so parts of the diff are shown as whole removals and additions to finish quickly.
        </p>
      )}

      <div ref={scroller} className={`relative max-h-[560px] min-h-[120px] overflow-auto bg-code-bg transition-opacity ${pending ? "opacity-60" : ""}`}>
        {!result.ok ? (
          <p role="alert" className="p-6 font-mono text-sm text-danger">
            {result.error}
          </p>
        ) : identical ? (
          <p role="status" className="flex items-center gap-2 p-6 text-sm text-success">
            <CheckDoubleIcon className="h-3 w-auto" /> No differences — both documents are equivalent.
          </p>
        ) : (
          <div className={view === "split" ? "min-w-full" : "w-max min-w-full"}>
            {view === "split"
              ? split.slice(0, limit).map((row) =>
                  row.type === "gap" ? (
                    <DiffGapRow key={`gap-${row.from}`} count={row.to - row.from} onExpand={() => setExpanded((s) => new Set(s).add(row.from))} />
                  ) : (
                    <DiffSplitRow key={row.index} index={row.index} left={row.left} right={row.right} active={isActive(row.index)} />
                  ),
                )
              : rows.slice(0, limit).map((row) =>
                  row.type === "gap" ? (
                    <DiffGapRow key={`gap-${row.from}`} count={row.to - row.from} onExpand={() => setExpanded((s) => new Set(s).add(row.from))} />
                  ) : (
                    <DiffLineRow key={row.index} index={row.index} line={row.line} active={isActive(row.index)} />
                  ),
                )}
            {visibleCount > limit && (
              <div className="p-3">
                <Button variant="soft" size="xs" onClick={() => setLimit((l) => l + pageSize)}>
                  Show {Math.min(pageSize, visibleCount - limit)} more rows
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
