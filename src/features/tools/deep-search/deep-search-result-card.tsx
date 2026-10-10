"use client";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CheckDoubleIcon } from "@/components/icons/check-double";
import { CopyIcon } from "@/components/icons/copy";
import { FolderTreeIcon } from "@/components/icons/folder-tree";
import { JsonTreeView } from "@/components/json/json-tree-view";
import { describeSize } from "@/core/json/describe";
import { formatPath, valueAtPath } from "@/core/json/path";
import { useClipboard } from "@/hooks/use-clipboard";
import { valueText, type SearchMatch } from "./deep-search";
import { DeepSearchHighlight } from "./deep-search-highlight";

const kindLabel = { key: "Key Match", value: "Value Match", path: "Path Match" } as const;
const kindTone = { key: "bg-brand/15 text-brand", value: "bg-success/15 text-success", path: "bg-tint-amber/15 text-tint-amber" } as const;

const action = "flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-semibold text-muted transition-colors hover:bg-border/40 hover:text-foreground";

function preview(m: SearchMatch) {
  if (m.type === "object") return `{${Object.keys(m.value as object).length} items}`;
  if (m.type === "array") return `[${(m.value as unknown[]).length}]`;
  return m.type === "string" ? JSON.stringify(m.value) : valueText(m.value);
}

export function DeepSearchResultCard({
  match,
  index,
  root,
  selected,
  expanded,
  onSelect,
  onToggleContext,
}: {
  match: SearchMatch;
  index: number;
  root: unknown;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleContext: () => void;
}) {
  const { copy, copied } = useClipboard();
  const parentPath = match.path.slice(0, -1);
  // Value ranges point into the unquoted text, so shift them past the opening quote of a string preview.
  const valueRanges = match.kind === "value" ? match.ranges.map(([s, e]) => (match.type === "string" ? [s + 1, e + 1] : [s, e]) as [number, number]) : [];

  return (
    <li
      aria-current={selected ? "true" : undefined}
      className={`overflow-hidden rounded-xl border bg-surface transition-colors ${selected ? "border-brand/60 shadow-[0_0_0_1px_var(--color-brand)]" : "border-border"}`}
    >
      <button type="button" onClick={onSelect} className="flex w-full items-center justify-between gap-3 border-b border-border/60 bg-background/40 px-4 py-3 text-left">
        <span className="flex min-w-0 items-center gap-3">
          <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] leading-[15px] font-bold tracking-[0.4px] uppercase ${kindTone[match.kind]}`}>{kindLabel[match.kind]}</span>
          <code className="min-w-0 truncate font-mono text-xs text-heading" title={match.pointer}>
            {match.kind === "path" ? <DeepSearchHighlight text={match.pointer} ranges={match.ranges} /> : match.pointer}
          </code>
        </span>
        <span className="shrink-0 text-[11px] text-muted">Result {index + 1}</span>
      </button>

      <div className="flex flex-col gap-3 p-4">
        {match.key !== undefined && (
          <p className="font-mono text-xs text-muted">
            Key{" "}
            <span className="text-json-key">
              {match.kind === "key" && typeof match.key === "string" ? <DeepSearchHighlight text={match.key} ranges={match.ranges} /> : String(match.key)}
            </span>
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold tracking-[0.6px] text-muted uppercase">Value</span>
          <div className="truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-heading">
            <DeepSearchHighlight text={preview(match)} ranges={valueRanges} />
          </div>
          <span className="flex items-center gap-2 text-[11px] text-muted">
            <span className="rounded bg-border/40 px-1.5 py-0.5 font-mono">{match.type}</span>
            {describeSize(match.value)}
          </span>
        </div>

        {expanded && (
          <div className="max-h-64 overflow-auto rounded-lg border border-border bg-code-bg">
            <JsonTreeView
              value={valueAtPath(root, parentPath)}
              rootLabel={parentPath.length ? String(parentPath[parentPath.length - 1]) : "root"}
              selectedPath={match.path.slice(parentPath.length)}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-1 border-t border-border/60 pt-2">
          <button type="button" className={action} onClick={() => copy(match.pointer, "path")}>
            {copied === "path" ? <CheckDoubleIcon className="h-3 w-auto text-success" /> : <CopyIcon className="size-3" />}
            {copied === "path" ? "Copied!" : "Copy Path"}
          </button>
          <button type="button" className={action} onClick={() => copy(match.type === "string" ? (match.value as string) : JSON.stringify(match.value, null, 2), "value")}>
            {copied === "value" ? <CheckDoubleIcon className="h-3 w-auto text-success" /> : <CopyIcon className="size-3" />}
            {copied === "value" ? "Copied!" : "Copy Value"}
          </button>
          <button type="button" className={action} onClick={onSelect}>
            <ArrowRightIcon className="h-3 w-auto" /> Go to Match
          </button>
          {match.depth > 0 && (
            <button type="button" className={action} onClick={onToggleContext} aria-expanded={expanded} title={`Show ${formatPath(parentPath)}`}>
              <FolderTreeIcon className="h-3 w-auto" /> {expanded ? "Collapse Context" : "Expand Context"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
