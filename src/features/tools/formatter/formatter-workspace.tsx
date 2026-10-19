"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
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
import { lintJson } from "@/core/json/lint";
import { looseFormat } from "@/core/json/loose-format";
import { describeParseError, parseJson } from "@/core/json/parse";
import { sortDeep } from "@/core/json/sort";
import { formatBytes } from "@/core/text/format-bytes";
import { useDownload } from "@/hooks/use-download";
import { useJsonColors } from "@/hooks/use-json-colors";
import { FormatterErrorView } from "./formatter-error-view";
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
  // Only invalid input needs the strict checker, which knows the exact offset of the error.
  const lint = useMemo(() => (parsed.ok || deferredInput.trim() === "" ? null : lintJson(deferredInput)), [parsed, deferredInput]);
  const lintError = lint && !lint.ok ? lint.error : null;

  const editor = useRef<HTMLTextAreaElement>(null);
  // Set when formatting the input should also select the error, applied once the new text has rendered.
  const pendingSelection = useRef<number | null>(null);

  // Formats the input in place so long one-line JSON can be edited; invalid JSON is indented anyway.
  const formatInput = (selectError: boolean) => {
    const valid = parseJson(input);
    if (valid.ok) {
      setInput(JSON.stringify(valid.value, null, 2));
      return;
    }
    const check = lintJson(input);
    const formatted = looseFormat(input, check.ok ? undefined : check.error.offset);
    if (selectError && formatted.mark) pendingSelection.current = formatted.mark.offset;
    setInput(formatted.text);
  };

  useEffect(() => {
    const at = pendingSelection.current;
    const box = editor.current;
    if (at === null || !box) return;
    pendingSelection.current = null;
    box.focus();
    box.setSelectionRange(at, at + 1);
    // Centre the selected line; the editor's line height is 20px plus 16px of top padding.
    const line = input.slice(0, at).split("\n").length;
    box.scrollTop = 16 + (line - 1) * 20 - box.clientHeight / 2;
  }, [input]);

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
            <>
              <Button variant="soft" size="tiny" onClick={() => formatInput(false)} disabled={!input.trim()} title="Indent the input so it's easier to edit">
                <AlignLeftIcon className="h-[11px] w-auto" /> Format
              </Button>
              <Button variant="soft" size="tiny" onClick={() => setInput("")} disabled={!input}>
                <TrashIcon className="h-[11px] w-auto" /> Clear
              </Button>
            </>
          }
        >
          <CodeEditor
            ref={editor}
            aria-label="JSON input"
            value={input}
            onChange={setInput}
            placeholder="Paste your JSON here…"
            highlightLine={lintError && input === deferredInput ? lintError.line : undefined}
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
              <JsonColorPicker colors={outputColors.colors} onChange={outputColors.setColor} onApply={outputColors.setAll} onReset={outputColors.reset} />
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
          {validity === "empty" ? null : lintError ? (
            <FormatterErrorView input={deferredInput} error={lintError} onFixInInput={() => formatInput(true)} />
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

      {validity !== "empty" && <FormatterStats size={size} lines={lines} validity={validity} />}
    </div>
  );
}
