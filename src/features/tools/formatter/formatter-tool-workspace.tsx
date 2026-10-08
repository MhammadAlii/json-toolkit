"use client";

import { useDeferredValue, useId, useMemo, useState } from "react";
import { CheckDoubleIcon } from "@/components/icons/check-double";
import { CopyIcon } from "@/components/icons/copy";
import { DownloadIcon } from "@/components/icons/download";
import { TrashIcon } from "@/components/icons/trash";
import { UploadIcon } from "@/components/icons/upload";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonColorPicker } from "@/components/json/json-color-picker";
import { JsonTableView } from "@/components/json/json-table-view";
import { JsonTreeExplorer } from "@/components/json/json-tree-explorer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CodeEditor } from "@/components/ui/code-editor";
import { FileButton } from "@/components/ui/file-button";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { Toolbar } from "@/components/ui/toolbar";
import { ToolbarDivider } from "@/components/ui/toolbar-divider";
import { describeParseError, parseJson } from "@/core/json/parse";
import { formatBytes } from "@/core/text/format-bytes";
import { useClipboard } from "@/hooks/use-clipboard";
import { useDownload } from "@/hooks/use-download";
import { useJsonColors } from "@/hooks/use-json-colors";
import { repairJson } from "@/features/tools/repair/repair";
import { sortDeep, type Indent } from "./formatter";
import { FormatterStats, type FormatterValidity } from "./formatter-stats";

export type FormatterView = "tree" | "table" | "code";

const views = [
  { value: "tree", label: "Tree" },
  { value: "table", label: "Table" },
  { value: "code", label: "Code" },
] as const;

const indents = [
  { value: "2", label: "2 Spaces" },
  { value: "4", label: "4 Spaces" },
  { value: "tab", label: "Tabs" },
] as const;

const panelHeight = "h-[420px] lg:h-[500px]";

export function FormatterToolWorkspace({ defaultView = "code" }: { defaultView?: FormatterView }) {
  const id = useId();
  const [input, setInput] = useState("");
  const [view, setView] = useState<FormatterView>(defaultView);
  const [indent, setIndent] = useState<Indent>("2");
  const [sortKeys, setSortKeys] = useState(false);
  const [fixQuotes, setFixQuotes] = useState(false);
  const { copy, copied } = useClipboard();
  const download = useDownload();
  const colors = useJsonColors();

  const deferred = useDeferredValue(input);
  const result = useMemo(() => {
    const source = fixQuotes && deferred.trim() ? repairJson(deferred) : null;
    const parsed = parseJson(source?.ok ? source.output : deferred);
    if (!parsed.ok) return { parsed, value: undefined, output: "" };
    const value = sortKeys ? sortDeep(parsed.value) : parsed.value;
    return { parsed, value, output: JSON.stringify(value, null, indent === "tab" ? "\t" : Number(indent)) };
  }, [deferred, fixQuotes, sortKeys, indent]);

  const validity: FormatterValidity = deferred.trim() === "" ? "empty" : result.parsed.ok ? "valid" : "invalid";
  const size = formatBytes(new TextEncoder().encode(deferred).length);
  const lines = (result.output || deferred).split("\n").length;

  return (
    <div className="flex flex-col gap-4">
      <Toolbar
        label="Formatter options"
        actions={
          <>
            <FileButton accept=".json,application/json,text/plain" onText={setInput}>
              <UploadIcon className="size-3.5" /> Load File
            </FileButton>
            <Button size="sm" onClick={() => result.output && setInput(result.output)} disabled={!result.output}>
              Format JSON
            </Button>
          </>
        }
      >
        <label htmlFor={`${id}-indent`} className="flex items-center gap-2 text-xs font-bold tracking-[0.6px] text-muted uppercase">
          Indent:
          <Select id={`${id}-indent`} size="sm" value={indent} onChange={(e) => setIndent(e.target.value as Indent)} options={indents} />
        </label>
        <ToolbarDivider />
        <Checkbox id={`${id}-sort`} label="Sort Keys" checked={sortKeys} onChange={setSortKeys} />
        <Checkbox id={`${id}-fix`} label="Fix Quotes" checked={fixQuotes} onChange={setFixQuotes} />
        <ToolbarDivider />
        <SegmentedControl label="Output view" options={views} value={view} onChange={setView} />
      </Toolbar>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <Panel
          className={panelHeight}
          header={<PanelTitle>Input</PanelTitle>}
          actions={
            <Button variant="ghost" size="tiny" onClick={() => setInput("")} disabled={!input}>
              <TrashIcon className="h-[11px] w-auto" /> Clear
            </Button>
          }
        >
          <CodeEditor aria-label="JSON input" value={input} onChange={setInput} placeholder="Paste your JSON here…" className="text-muted/80 placeholder:text-muted/40" />
        </Panel>

        <Panel
          className={panelHeight}
          bodyStyle={colors.style}
          header={<PanelTitle>Output</PanelTitle>}
          actions={
            <>
              <JsonColorPicker colors={colors.colors} onChange={colors.setColor} onReset={colors.reset} />
              <Button variant="ghost" size="tiny" onClick={() => copy(result.output)} disabled={!result.output}>
                {copied ? <CheckDoubleIcon className="h-[11px] w-auto text-success" /> : <CopyIcon className="size-[11px]" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="ghost" size="tiny" onClick={() => download(result.output, "formatted.json")} disabled={!result.output}>
                <DownloadIcon className="size-[11px]" /> Download
              </Button>
            </>
          }
        >
          {validity === "empty" ? (
            <p className="p-4 font-mono text-sm leading-5 text-muted/60">Output appears here.</p>
          ) : !result.parsed.ok ? (
            <p role="alert" className="p-4 font-mono text-sm leading-5 text-danger">
              {describeParseError(result.parsed.error)}
            </p>
          ) : view === "tree" ? (
            <JsonTreeExplorer value={result.value} />
          ) : view === "table" ? (
            <JsonTableView value={result.value} />
          ) : (
            <JsonCodeView text={result.output} />
          )}
        </Panel>
      </div>

      <FormatterStats size={size} lines={lines} validity={validity} />
    </div>
  );
}
