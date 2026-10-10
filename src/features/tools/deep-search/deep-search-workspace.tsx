"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { ChevronRightIcon } from "@/components/icons/chevron-right";
import { DownloadIcon } from "@/components/icons/download";
import { TrashIcon } from "@/components/icons/trash";
import { WrenchIcon } from "@/components/icons/wrench";
import { toolPanelHeight } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { CopyIconButton } from "@/components/ui/copy-icon-button";
import { DropZone } from "@/components/ui/drop-zone";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";
import { toCsv } from "@/core/json/csv";
import { lintJson } from "@/core/json/lint";
import { locateLines } from "@/core/json/locate";
import { repairJson } from "@/features/tools/repair/repair";
import { explain } from "@/features/tools/validator/validator";
import { useDownload } from "@/hooks/use-download";
import { useStoredState } from "@/hooks/use-stored-state";
import { deepSearch, defaultSearchOptions, matchRows, type SearchOptions } from "./deep-search";
import { DeepSearchBar } from "./deep-search-bar";
import { DeepSearchNoResults } from "./deep-search-no-results";
import { DeepSearchResultCard } from "./deep-search-result-card";
import { DeepSearchStats } from "./deep-search-stats";

const lineHeight = 20;
// Rendering thousands of cards at once is slow, so results are revealed in pages.
const pageSize = 100;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export function DeepSearchWorkspace() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [options, setOptions] = useStoredState<SearchOptions>("json-toolkit:search-options", defaultSearchOptions);
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set());
  const [limit, setLimit] = useState(pageSize);
  const editor = useRef<HTMLTextAreaElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const download = useDownload();

  const text = useDeferredValue(input);
  const q = useDeferredValue(query);
  const lint = useMemo(() => (text.trim() ? lintJson(text) : null), [text]);
  const value = useMemo(() => (lint?.ok ? (JSON.parse(text) as unknown) : undefined), [lint, text]);
  const result = useMemo(() => (lint?.ok ? deepSearch(value, q, { ...defaultSearchOptions, ...options }) : null), [lint, value, q, options]);
  const lineOf = useMemo(() => (lint?.ok ? locateLines(text) : null), [lint, text]);
  const matches = useMemo(() => (result?.ok ? result.matches : []), [result]);
  const current = matches[Math.min(selected, matches.length - 1)];
  const matchLine = current && lineOf ? lineOf(current.path) : undefined;
  const invalid = lint && !lint.ok ? lint.error : null;
  const repaired = useMemo(() => (invalid ? repairJson(text) : null), [invalid, text]);

  const scrollEditorTo = (line: number) => {
    const el = editor.current;
    if (el) el.scrollTop = Math.max(0, (line - 1) * lineHeight - el.clientHeight / 3);
  };

  const select = (index: number, focusEditor = false) => {
    if (index >= limit) setLimit(index + pageSize);
    setSelected(index);
    const line = lineOf?.(matches[index].path);
    if (line === undefined) return;
    scrollEditorTo(line);
    if (focusEditor && editor.current) {
      const start = text.split("\n").slice(0, line - 1).join("\n").length + (line > 1 ? 1 : 0);
      editor.current.focus({ preventScroll: true });
      editor.current.setSelectionRange(start, start);
    }
  };

  const move = (step: 1 | -1) => {
    if (!matches.length) return;
    select((Math.min(selected, matches.length - 1) + step + matches.length) % matches.length);
  };

  // Keep the selected card in view when navigating with the buttons or n / p.
  useEffect(() => {
    list.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest" });
  }, [selected]);

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

  const resetSelection = () => {
    setSelected(0);
    setExpanded(new Set());
    setLimit(pageSize);
  };

  const exportText = useMemo(() => JSON.stringify(matchRows(matches), null, 2), [matches]);

  return (
    <div className="flex flex-col gap-8">
      <DeepSearchBar
        query={query}
        options={{ ...defaultSearchOptions, ...options }}
        error={result && !result.ok ? result.error : undefined}
        onQueryChange={(next) => {
          setQuery(next);
          resetSelection();
        }}
        onOptionsChange={(next) => {
          setOptions(next);
          resetSelection();
        }}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          className={toolPanelHeight}
          bodyClassName="flex flex-col overflow-hidden"
          header={
            <div className="flex items-center gap-3">
              <PanelTitle>Input JSON</PanelTitle>
              {lint && (
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${lint.ok ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                  {lint.ok ? "Valid" : "Invalid"}
                </span>
              )}
            </div>
          }
          actions={
            <>
              <Button variant="soft" size="tiny" onClick={() => lint?.ok && setInput(JSON.stringify(value, null, 2))} disabled={!lint?.ok}>
                <AlignLeftIcon className="h-[11px] w-auto" /> Format
              </Button>
              <Button variant="soft" size="tiny" onClick={() => setInput("")} disabled={!input}>
                <TrashIcon className="h-[11px] w-auto" /> Clear
              </Button>
            </>
          }
        >
          <DropZone onText={setInput} className="min-h-0 flex-1">
            <CodeEditor
              ref={editor}
              aria-label="JSON to search"
              value={input}
              onChange={(next) => {
                setInput(next);
                resetSelection();
              }}
              highlightLine={input === text ? (invalid ? invalid.line : matchLine) : undefined}
              highlightTone={invalid ? "danger" : "brand"}
              placeholder="Paste your JSON here…"
              className="text-muted/80 placeholder:text-muted/40"
            />
          </DropZone>
          {invalid && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-t border-danger/30 bg-danger/5 px-4 py-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-heading">
                  Invalid JSON Syntax
                  <span className="rounded bg-danger/15 px-1.5 py-0.5 font-mono text-[11px] text-danger">
                    Line {invalid.line}, Column {invalid.column}
                  </span>
                </p>
                <p className="truncate text-xs text-muted">
                  {(() => {
                    const e = explain(invalid);
                    return `${e.lead}${e.token ?? ""}${e.trail}`;
                  })()}
                </p>
              </div>
              <Button variant="secondary" size="xs" onClick={() => repaired?.ok && setInput(repaired.output)} disabled={!repaired?.ok}>
                <WrenchIcon className="h-3 w-auto" /> Fix Now
              </Button>
            </div>
          )}
        </Panel>

        <Panel
          className={toolPanelHeight}
          header={
            <div className="flex items-center gap-3">
              <PanelTitle>Search Results</PanelTitle>
              {result?.ok && q && (
                <span role="status" className="rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand uppercase">
                  {result.truncated ? `First ${matches.length}` : `${matches.length} ${matches.length === 1 ? "match" : "matches"}`}
                </span>
              )}
            </div>
          }
          actions={
            matches.length > 0 && (
              <>
                <span className="flex items-center gap-1">
                  <Button variant="soft" size="tiny" onClick={() => move(-1)} aria-label="Previous match" aria-keyshortcuts="p">
                    <ChevronRightIcon className="h-2.5 w-auto rotate-180" />
                  </Button>
                  <span className="min-w-12 text-center font-mono text-[11px] text-muted">
                    {Math.min(selected, matches.length - 1) + 1} / {matches.length}
                  </span>
                  <Button variant="soft" size="tiny" onClick={() => move(1)} aria-label="Next match" aria-keyshortcuts="n">
                    <ChevronRightIcon className="h-2.5 w-auto" />
                  </Button>
                </span>
                <span aria-hidden className="mx-1 h-4 w-px bg-border" />
                <CopyIconButton text={exportText} label="Copy results as JSON" />
                <Button variant="soft" size="tiny" onClick={() => download(toCsv(matchRows(matches)).csv, "search-results.csv", "text/csv")} aria-label="Export results as CSV">
                  <DownloadIcon className="size-[11px]" /> CSV
                </Button>
              </>
            )
          }
        >
          {result?.ok && q && matches.length === 0 && <DeepSearchNoResults query={q} options={{ ...defaultSearchOptions, ...options }} />}
          {matches.length > 0 && (
            <ol ref={list} className="flex flex-col gap-3 p-4">
              {matches.slice(0, limit).map((m, i) => (
                <DeepSearchResultCard
                  key={`${m.pointer}:${m.kind}`}
                  match={m}
                  index={i}
                  root={value}
                  selected={i === Math.min(selected, matches.length - 1)}
                  expanded={expanded.has(i)}
                  onSelect={() => select(i, true)}
                  onToggleContext={() =>
                    setExpanded((s) => {
                      const next = new Set(s);
                      if (next.has(i)) next.delete(i);
                      else next.add(i);
                      return next;
                    })
                  }
                />
              ))}
              {matches.length > limit && (
                <li>
                  <Button variant="soft" size="xs" onClick={() => setLimit((l) => l + pageSize)}>
                    Show {Math.min(pageSize, matches.length - limit)} more
                  </Button>
                </li>
              )}
            </ol>
          )}
        </Panel>
      </div>

      {result?.ok && q && <DeepSearchStats matches={matches.length} nodes={result.nodesScanned} ms={result.ms} depth={result.maxDepth} />}
    </div>
  );
}
