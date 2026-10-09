"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { RightLeftIcon } from "@/components/icons/right-left";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
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
  const { run, pending, output } = useWorkerTask<CompareInput, CompareResult>(createWorker, compareOnMainThread);

  const left = useDeferredValue(a);
  const right = useDeferredValue(b);
  const ready = left.trim() !== "" && right.trim() !== "";
  const optionsKey = JSON.stringify(options);

  // Compares as you type; the worker drops any comparison that's still running.
  useEffect(() => {
    if (ready) run({ left, right, options: JSON.parse(optionsKey) as DiffOptions });
  }, [ready, left, right, optionsKey, run]);

  const swap = () => {
    setA(b);
    setB(a);
  };

  const format = (set: (update: (text: string) => string) => void, value: string) => (
    <Button variant="soft" size="tiny" onClick={() => set(prettify)} disabled={!value}>
      <AlignLeftIcon className="h-[11px] w-auto" /> Format
    </Button>
  );

  return (
    <div
      className="flex flex-col gap-8"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
          e.preventDefault();
          swap();
        }
      }}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel title="Original (A)" label="Original JSON (A)" value={a} onChange={setA} extraActions={format(setA, a)} />
        <JsonInputPanel
          title="Changed (B)"
          label="Changed JSON (B)"
          value={b}
          onChange={setB}
          extraActions={
            <>
              <Button variant="soft" size="tiny" onClick={swap} disabled={!a && !b} aria-keyshortcuts="Meta+Backslash" title="Swap A and B (Cmd + \)">
                <RightLeftIcon className="h-[11px] w-auto" /> Swap
              </Button>
              {format(setB, b)}
            </>
          }
        />
      </div>

      {ready && output && (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_274px]">
          <DiffResult
            result={output}
            pending={pending}
            lossy={isLossy(options)}
            view={view}
            onViewChange={setView}
            options={<DiffOptionsMenu options={options} onChange={setOptions} />}
          />
          <DiffProTips />
        </div>
      )}
    </div>
  );
}
