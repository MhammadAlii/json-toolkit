"use client";

import { useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { CodeCompareIcon } from "@/components/icons/code-compare";
import { RightLeftIcon } from "@/components/icons/right-left";
import { TrashIcon } from "@/components/icons/trash";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeEditor } from "@/components/ui/code-editor";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";
import { parseJson } from "@/core/json/parse";
import { diffJsonLines, type LineDiffResult } from "./diff";
import { DiffProTips } from "./diff-pro-tips";
import { DiffResult } from "./diff-result";

const prettify = (text: string) => {
  const parsed = parseJson(text);
  return parsed.ok ? JSON.stringify(parsed.value, null, 2) : text;
};

export function DiffWorkspace() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [compared, setCompared] = useState<{ a: string; b: string; result: LineDiffResult; run: number } | null>(null);

  const compare = (left = a, right = b) => setCompared((c) => ({ a: left, b: right, result: diffJsonLines(left, right), run: (c?.run ?? 0) + 1 }));
  const swap = () => {
    setA(b);
    setB(a);
    if (compared) compare(b, a);
  };
  const canCompare = a.trim() !== "" && b.trim() !== "";
  const stale = !!compared && (compared.a !== a || compared.b !== b);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.key === "\\") {
      e.preventDefault();
      swap();
    } else if (e.key === "Enter" && canCompare) {
      e.preventDefault();
      compare();
    }
  };

  const editor = (label: string, title: string, value: string, onChange: (v: string) => void) => (
    <Panel
      className="h-[320px] lg:h-[500px]"
      header={<PanelTitle>{title}</PanelTitle>}
      actions={
        <Button variant="soft" size="tiny" onClick={() => onChange("")} disabled={!value}>
          <TrashIcon className="h-[11px] w-auto" /> Clear
        </Button>
      }
    >
      <CodeEditor aria-label={label} value={value} onChange={onChange} placeholder="Paste JSON here…" className="text-muted/80 placeholder:text-muted/40" />
    </Panel>
  );

  return (
    <div className="flex flex-col gap-8" onKeyDown={onKeyDown}>
      <div className="flex flex-col gap-4">
        <Card tone="surface" className="flex flex-wrap items-center justify-between gap-3 px-3 py-3.5">
          <Button size="sm" className="min-w-[160px] py-2.5" onClick={() => compare()} disabled={!canCompare}>
            <CodeCompareIcon className="size-4" /> Compare
          </Button>
          <Button variant="secondary" size="sm" className="py-2.5" onClick={swap} disabled={!a && !b} aria-keyshortcuts="Meta+Backslash">
            <RightLeftIcon className="size-4" /> Swap A/B
          </Button>
          <Button variant="secondary" size="sm" className="py-2.5" onClick={() => {
              setA(prettify);
              setB(prettify);
            }} disabled={!a && !b}>
            <AlignLeftIcon className="size-4" /> Format Both
          </Button>
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          {editor("Original JSON (A)", "Original (A)", a, setA)}
          {editor("Changed JSON (B)", "Changed (B)", b, setB)}
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_274px]">
        <DiffResult key={compared?.run ?? 0} result={compared?.result ?? null} stale={stale} />
        <DiffProTips />
      </div>
    </div>
  );
}
