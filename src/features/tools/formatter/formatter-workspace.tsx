"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownAZIcon } from "@/components/icons/arrow-down-a-z";
import { CompressIcon } from "@/components/icons/compress";
import { DownloadIcon } from "@/components/icons/download";
import { TrashIcon } from "@/components/icons/trash";
import { WandIcon } from "@/components/icons/wand";
import { WrenchIcon } from "@/components/icons/wrench";
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
import { useStoredState } from "@/hooks/use-stored-state";
import { repair } from "@/features/tools/repair/repair";
import { FormatterErrorView } from "./formatter-error-view";
import { FormatterFixNotice } from "./formatter-fix-notice";
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
  const [autoFix, setAutoFix] = useStoredState<boolean>("json-toolkit:formatter-auto-fix", false);
  const download = useDownload();
  const outputColors = useJsonColors();

  const deferredInput = useDeferredValue(input);
  const parsed = useMemo(() => parseJson(deferredInput), [deferredInput]);
  // With Auto-fix on, invalid input is repaired for the output; the input itself is left as typed.
  const fixed = useMemo(() => {
    if (!autoFix || parsed.ok || deferredInput.trim() === "") return null;
    const result = repair(deferredInput);
    return result.status === "repaired" ? { value: JSON.parse(result.output) as unknown, changes: result.changes } : null;
  }, [autoFix, parsed, deferredInput]);
  const source = parsed.ok ? parsed.value : fixed ? fixed.value : undefined;
  const hasValue = parsed.ok || fixed !== null;
  const value = useMemo(() => (hasValue && sortKeys ? sortDeep(source) : source), [hasValue, source, sortKeys]);
  const output = hasValue ? JSON.stringify(value, null, mode === "format" ? 2 : undefined) : "";
  // Only input that is still invalid needs the strict checker, which knows the exact offset of the error.
  const lint = useMemo(() => (hasValue || deferredInput.trim() === "" ? null : lintJson(deferredInput)), [hasValue, deferredInput]);
  const lintError = lint && !lint.ok ? lint.error : null;

  const editor = useRef<HTMLTextAreaElement>(null);
  // Set when formatting the input should also select the error, applied once the new text has rendered.
  const pendingSelection = useRef<number | null>(null);

  // Indents invalid text in place and selects its first issue, so it can be fixed even in long one-line JSON.
  const formatAndSelectIssue = (text: string) => {
    const check = lintJson(text);
    if (check.ok) return setInput(text);
    const formatted = looseFormat(text, check.error.offset);
    if (formatted.mark) pendingSelection.current = formatted.mark.offset;
    setInput(formatted.text);
  };
  const fixInInput = () => formatAndSelectIssue(input);

  // A paste of invalid JSON is formatted straight away; typing isn't, so text doesn't move under the cursor.
  const pasted = useRef(false);
  const onInputChange = (text: string) => {
    if (pasted.current) {
      pasted.current = false;
      return formatAndSelectIssue(text);
    }
    setInput(text);
  };

  useEffect(() => {
    const at = pendingSelection.current;
    const box = editor.current;
    if (at === null || !box) return;
    pendingSelection.current = null;
    box.focus();
    box.setSelectionRange(at, at + 1);
    // Centre the selected line (20px lines, 16px top padding). The browser scrolls the cursor to the edge
    // on its own after focusing, so this runs a frame later to win.
    const line = input.slice(0, at).split("\n").length;
    const frame = requestAnimationFrame(() => {
      box.scrollTop = 16 + (line - 1) * 20 - box.clientHeight / 2;
    });
    return () => cancelAnimationFrame(frame);
  }, [input]);

  const validity: FormatterValidity = deferredInput.trim() === "" ? "empty" : parsed.ok ? "valid" : fixed ? "fixed" : "invalid";
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
              <Button
                variant={autoFix ? "accent" : "soft"}
                size="tiny"
                onClick={() => setAutoFix(!autoFix)}
                aria-pressed={autoFix}
                title="Repair common mistakes automatically: trailing commas, single quotes, comments, missing brackets"
              >
                <WrenchIcon className="h-[11px] w-auto" /> Auto-fix
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
            onChange={onInputChange}
            onPaste={() => {
              pasted.current = true;
              // The change event follows the paste synchronously; clear the flag if the paste changed nothing.
              setTimeout(() => (pasted.current = false), 0);
            }}
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
            <FormatterErrorView input={deferredInput} error={lintError} onFixInInput={fixInInput} />
          ) : !hasValue && !parsed.ok ? (
            <p role="alert" className="p-4 font-mono text-sm leading-5 text-danger">
              {describeParseError(parsed.error)}
            </p>
          ) : (
            <>
              {fixed && <FormatterFixNotice changes={fixed.changes} />}
              {view === "code" ? <JsonCodeView text={output} /> : view === "tree" ? <JsonTreeExplorer value={value} /> : <JsonTableExplorer value={value} />}
            </>
          )}
        </Panel>
      </div>

      {validity !== "empty" && <FormatterStats size={size} lines={lines} validity={validity} />}
    </div>
  );
}
