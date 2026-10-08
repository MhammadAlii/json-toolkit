"use client";

import { useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { CodeCompareIcon } from "@/components/icons/code-compare";
import { RightLeftIcon } from "@/components/icons/right-left";
import { Button } from "@/components/ui/button";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Card } from "@/components/ui/card";
import { parseJson } from "@/core/json/parse";
import { useStoredState } from "@/hooks/use-stored-state";
import { useWorkerTask } from "@/hooks/use-worker-task";
import { compareJson, defaultDiffOptions, isLossy, type CompareResult, type DiffOptions } from "./diff";
import { DiffOptionsMenu } from "./diff-options-menu";
import { DiffProTips } from "./diff-pro-tips";
import { DiffResult, type DiffViewMode } from "./diff-result";

type CompareInput = { left: string; right: string; options: DiffOptions };

const createWorker = () => new Worker(new URL("./diff.worker.ts", import.meta.url));
const compareOnMainThread = ({ left, right, options }: CompareInput) => compareJson(left, right, options, Date.now() + 1500);

const prettify = (text: string) => {
  const parsed = parseJson(text);
  return parsed.ok ? JSON.stringify(parsed.value, null, 2) : text;
};

export function DiffWorkspace() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [options, setOptions] = useStoredState<DiffOptions>("json-toolkit:diff-options", defaultDiffOptions);
  const [view, setView] = useStoredState<DiffViewMode>("json-toolkit:diff-view", "unified");
  const [compared, setCompared] = useState<CompareInput & { run: number }>();
  const task = useWorkerTask<CompareInput, CompareResult>(createWorker, compareOnMainThread);

  const compare = (left = a, right = b, opts = options) => {
    task.run({ left, right, options: opts });
    setCompared((c) => ({ left, right, options: opts, run: (c?.run ?? 0) + 1 }));
  };
  const swap = () => {
    setA(b);
    setB(a);
    if (compared) compare(b, a);
  };
  const canCompare = a.trim() !== "" && b.trim() !== "";
  const stale = !!compared && (compared.left !== a || compared.right !== b || JSON.stringify(compared.options) !== JSON.stringify(options));

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

  return (
    <div className="flex flex-col gap-8" onKeyDown={onKeyDown}>
      <div className="flex flex-col gap-4">
        <Card tone="surface" className="flex flex-wrap items-center justify-between gap-3 px-3 py-3.5">
          <Button size="sm" className="min-w-[160px] py-2.5" onClick={() => compare()} disabled={!canCompare} aria-keyshortcuts="Meta+Enter">
            <CodeCompareIcon className="size-4" /> {task.pending ? "Comparing…" : "Compare"}
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="sm" className="py-2.5" onClick={swap} disabled={!a && !b} aria-keyshortcuts="Meta+Backslash">
              <RightLeftIcon className="size-4" /> Swap A/B
            </Button>
            <DiffOptionsMenu options={options} onChange={setOptions} />
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="py-2.5"
            onClick={() => {
              setA(prettify);
              setB(prettify);
            }}
            disabled={!a && !b}
          >
            <AlignLeftIcon className="size-4" /> Format Both
          </Button>
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          <JsonInputPanel title="Original (A)" label="Original JSON (A)" value={a} onChange={setA} />
          <JsonInputPanel title="Changed (B)" label="Changed JSON (B)" value={b} onChange={setB} />
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_274px]">
        <DiffResult
          key={compared?.run ?? 0}
          result={task.output}
          pending={task.pending}
          stale={stale}
          lossy={isLossy(compared?.options ?? options)}
          view={view}
          onViewChange={setView}
        />
        <DiffProTips />
      </div>
    </div>
  );
}
