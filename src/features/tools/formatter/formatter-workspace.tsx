"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ArrowDownAZIcon } from "@/components/icons/arrow-down-a-z";
import { CheckDoubleIcon } from "@/components/icons/check-double";
import { CompressIcon } from "@/components/icons/compress";
import { CopyIcon } from "@/components/icons/copy";
import { DownloadIcon } from "@/components/icons/download";
import { TrashIcon } from "@/components/icons/trash";
import { WandIcon } from "@/components/icons/wand";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonColorPicker } from "@/components/json/json-color-picker";
import { JsonTableExplorer } from "@/components/json/json-table-explorer";
import { JsonTreeExplorer } from "@/components/json/json-tree-explorer";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { describeParseError, parseJson } from "@/core/json/parse";
import { formatBytes } from "@/core/text/format-bytes";
import { useClipboard } from "@/hooks/use-clipboard";
import { useDownload } from "@/hooks/use-download";
import { useJsonColors } from "@/hooks/use-json-colors";
import { sortDeep } from "./formatter";
import { FormatterStats, type FormatterValidity } from "./formatter-stats";

export type FormatterView = "code" | "tree" | "table";
type Mode = "format" | "minify";

const views = [
  { value: "code", label: "Code" },
  { value: "tree", label: "Tree" },
  { value: "table", label: "Table" },
] as const;

const panelHeight = "h-[360px] lg:h-[600px]";

export function FormatterWorkspace({ defaultView = "code" }: { defaultView?: FormatterView }) {
  const [input, setInput] = useState("");
  const [view, setView] = useState<FormatterView>(defaultView);
  const [mode, setMode] = useState<Mode>("format");
  const [sortKeys, setSortKeys] = useState(false);
  const { copy, copied, failed } = useClipboard();
  const download = useDownload();
  const outputColors = useJsonColors();

  const deferredInput = useDeferredValue(input);
  const parsed = useMemo(() => parseJson(deferredInput), [deferredInput]);
  const value = useMemo(() => (parsed.ok && sortKeys ? sortDeep(parsed.value) : parsed.ok ? parsed.value : undefined), [parsed, sortKeys]);
  const output = parsed.ok ? JSON.stringify(value, null, mode === "format" ? 2 : undefined) : "";

  const validity: FormatterValidity = deferredInput.trim() === "" ? "empty" : parsed.ok ? "valid" : "invalid";
  const size = formatBytes(new TextEncoder().encode(deferredInput).length);
  const lines = (output || deferredInput).split("\n").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]">
        <Panel
          className={panelHeight}
          header={<PanelTitle>Input</PanelTitle>}
          actions={
            <Button variant="soft" size="tiny" onClick={() => setInput("")} disabled={!input}>
              <TrashIcon className="h-[11px] w-auto" /> Clear
            </Button>
          }
        >
          <CodeEditor
            aria-label="JSON input"
            value={input}
            onChange={setInput}
            placeholder="Paste your JSON here…"
            className="text-muted/80 placeholder:text-muted/40"
          />
        </Panel>

        <Panel
          bodyStyle={outputColors.style}
          className={panelHeight}
          header={<SegmentedControl label="Output view" options={views} value={view} onChange={setView} />}
          actions={
            <>
              <Button variant={mode === "format" ? "accent" : "soft"} size="tiny" onClick={() => setMode("format")} aria-pressed={mode === "format"}>
                <WandIcon className="h-[11px] w-auto" /> Format
              </Button>
              <Button variant={mode === "minify" ? "accent" : "soft"} size="tiny" onClick={() => setMode("minify")} aria-pressed={mode === "minify"}>
                <CompressIcon className="h-[11px] w-auto" /> Minify
              </Button>
              <Button variant={sortKeys ? "accent" : "soft"} size="tiny" onClick={() => setSortKeys((s) => !s)} aria-pressed={sortKeys}>
                <ArrowDownAZIcon className="h-[11px] w-auto" /> Sort
              </Button>
              <span aria-hidden className="mx-1 h-4 w-px bg-border" />
              <JsonColorPicker colors={outputColors.colors} onChange={outputColors.setColor} onReset={outputColors.reset} />
              <span className="relative">
                <Button
                  variant="soft"
                  size="tiny"
                  onClick={() => copy(output)}
                  disabled={!output}
                  aria-label={copied ? "Copied" : failed ? "Copy failed" : "Copy output"}
                >
                  {copied ? <CheckDoubleIcon className="h-[11px] w-auto text-success" /> : <CopyIcon className="size-[11px]" />}
                </Button>
                {(copied || failed) && (
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute top-full left-1/2 z-10 mt-1.5 -translate-x-1/2 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] leading-4 font-semibold whitespace-nowrap shadow-lg ${
                      copied ? "text-success" : "text-danger"
                    }`}
                  >
                    {copied ? "Copied!" : "Copy failed"}
                  </span>
                )}
              </span>
              <span role="status" className="sr-only">
                {copied ? "Output copied to clipboard" : failed ? "Couldn't copy. Select the output and copy it manually." : ""}
              </span>
              <Button
                variant="soft"
                size="tiny"
                onClick={() => download(output, mode === "format" ? "formatted.json" : "minified.json")}
                disabled={!output}
                aria-label="Download output"
              >
                <DownloadIcon className="size-[11px]" />
              </Button>
            </>
          }
        >
          {validity === "empty" ? (
            <p className="p-4 font-mono text-sm leading-5 text-muted/60">Output appears here.</p>
          ) : !parsed.ok ? (
            <p role="alert" className="p-4 font-mono text-sm leading-5 text-danger">
              {describeParseError(parsed.error)}
            </p>
          ) : view === "code" ? (
            <JsonCodeView text={output} />
          ) : view === "tree" ? (
            <JsonTreeExplorer value={value} />
          ) : (
            <JsonTableExplorer value={value} />
          )}
        </Panel>
      </div>

      <FormatterStats size={size} lines={lines} validity={validity} />
    </div>
  );
}
