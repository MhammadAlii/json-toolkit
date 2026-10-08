"use client";

import { useState } from "react";
import { CheckDoubleIcon } from "@/components/icons/check-double";
import { CopyIcon } from "@/components/icons/copy";
import { DownloadIcon } from "@/components/icons/download";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonTableExplorer } from "@/components/json/json-table-explorer";
import { JsonTreeExplorer } from "@/components/json/json-tree-explorer";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useClipboard } from "@/hooks/use-clipboard";
import { useDownload } from "@/hooks/use-download";
import { useJsonColors } from "@/hooks/use-json-colors";
import type { PipelineResult } from "./query-selector";

type View = "code" | "table" | "tree";

const views = [
  { value: "code", label: "Code" },
  { value: "table", label: "Table" },
  { value: "tree", label: "Tree" },
] as const;

export function QueryResultPanel({ result, className }: { result: PipelineResult | null; className: string }) {
  const [view, setView] = useState<View>("code");
  const { copy, copied } = useClipboard();
  const download = useDownload();
  const colors = useJsonColors();
  const output = result?.ok ? JSON.stringify(result.value, null, 2) : "";

  return (
    <Panel
      className={className}
      bodyStyle={colors.style}
      header={
        <div className="flex items-center gap-3">
          <SegmentedControl label="Result view" options={views} value={view} onChange={setView} />
          {result?.ok && (
            <span role="status" className="text-[11px] font-semibold text-muted">
              {result.count} {result.count === 1 ? "result" : "results"}
            </span>
          )}
        </div>
      }
      actions={
        <>
          <Button variant="soft" size="tiny" onClick={() => copy(output)} disabled={!output} aria-label={copied ? "Copied" : "Copy result"}>
            {copied ? <CheckDoubleIcon className="h-[11px] w-auto text-success" /> : <CopyIcon className="size-[11px]" />}
          </Button>
          <Button variant="soft" size="tiny" onClick={() => download(output, "query-result.json")} disabled={!output}>
            <DownloadIcon className="size-[11px]" /> Export
          </Button>
        </>
      }
    >
      {!result ? (
        <p className="p-4 text-sm leading-5 text-muted/60">Paste or import JSON to see the result.</p>
      ) : !result.ok && result.stage !== undefined ? (
        <p className="p-4 text-sm leading-5 text-muted">Fix the highlighted stage above to see results.</p>
      ) : !result.ok ? (
        <p role="alert" className="p-4 font-mono text-sm leading-5 text-danger">
          {result.error}
        </p>
      ) : view === "code" ? (
        <JsonCodeView text={output} />
      ) : view === "table" ? (
        <JsonTableExplorer value={result.value} />
      ) : (
        <JsonTreeExplorer value={result.value} />
      )}
    </Panel>
  );
}
