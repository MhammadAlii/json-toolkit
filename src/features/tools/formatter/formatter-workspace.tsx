"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ArrowDownAZIcon } from "@/components/icons/arrow-down-a-z";
import { CompressIcon } from "@/components/icons/compress";
import { DownloadIcon } from "@/components/icons/download";
import { TrashIcon } from "@/components/icons/trash";
import { WandIcon } from "@/components/icons/wand";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonColorPicker } from "@/components/json/json-color-picker";
import { JsonTableExplorer } from "@/components/json/json-table-explorer";
import { JsonTreeExplorer } from "@/components/json/json-tree-explorer";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { CopyIconButton } from "@/components/ui/copy-icon-button";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { describeParseError, parseJson } from "@/core/json/parse";
import { sortDeep } from "@/core/json/sort";
import { formatBytes } from "@/core/text/format-bytes";
import { useDownload } from "@/hooks/use-download";
import { useJsonColors } from "@/hooks/use-json-colors";
import { FormatterStats, type FormatterValidity } from "./formatter-stats";

export type FormatterView = "code" | "tree" | "table";
type Mode = "format" | "minify";

const views = [
  { value: "code", label: "Code" },
  { value: "tree", label: "Tree" },
  { value: "table", label: "Table" },
] as const;

const panelHeight = "h-[360px] lg:h-[600px]";

// `lockedView` pins the output to one view (the Tree and Table Viewer pages) and hides the switcher.
export function FormatterWorkspace({ lockedView }: { lockedView?: FormatterView }) {
  const [input, setInput] = useState("");
  const [chosenView, setView] = useState<FormatterView>("code");
  const view = lockedView ?? chosenView;
  const [mode, setMode] = useState<Mode>("format");
  const [sortKeys, setSortKeys] = useState(false);
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
          header={
            lockedView ? (
              <PanelTitle>{`${views.find((v) => v.value === lockedView)?.label} View`}</PanelTitle>
            ) : (
              <SegmentedControl label="Output view" options={views} value={view} onChange={setView} />
            )
          }
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
              <CopyIconButton text={output} />
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
          {validity === "empty" ? null : !parsed.ok ? (
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

      {validity !== "empty" && <FormatterStats size={size} lines={lines} validity={validity} />}
    </div>
  );
}
