"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { CheckDoubleIcon } from "@/components/icons/check-double";
import { CodeIcon } from "@/components/icons/code";
import { CompressIcon } from "@/components/icons/compress";
import { CopyIcon } from "@/components/icons/copy";
import { TrashIcon } from "@/components/icons/trash";
import { UploadIcon } from "@/components/icons/upload";
import { jsonAccept } from "@/components/tool/workbench-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeEditor } from "@/components/ui/code-editor";
import { DropZone } from "@/components/ui/drop-zone";
import { FileButton } from "@/components/ui/file-button";
import { Panel } from "@/components/ui/panel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { positionToLineColumn } from "@/core/json/parse";
import { formatBytes } from "@/core/text/format-bytes";
import { repairJson } from "@/features/tools/repair/repair";
import { useClipboard } from "@/hooks/use-clipboard";
import { validateJsonText } from "./validator";
import { ValidatorExplanationCard } from "./validator-explanation-card";
import { ValidatorResultCard } from "./validator-result-card";
import { ValidatorStatusPill } from "./validator-status-pill";
import { ValidatorStructureCard } from "./validator-structure-card";

type Style = "format" | "minify";

const styles = [
  { value: "format", label: "Format" },
  { value: "minify", label: "Minify" },
] as const;

const lineHeight = 20;

export function ValidatorWorkspace() {
  const [input, setInput] = useState("");
  const [style, setStyle] = useState<Style>("format");
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const editor = useRef<HTMLTextAreaElement>(null);
  const { copy, copied } = useClipboard();

  const text = useDeferredValue(input);
  const validation = useMemo(() => validateJsonText(text), [text]);
  const repaired = useMemo(() => (validation.status === "invalid" ? repairJson(text) : null), [validation, text]);
  const size = text ? formatBytes(new TextEncoder().encode(text).length) : "—";
  const lines = input.split("\n").length;

  const apply = () => {
    if (validation.status !== "valid") return;
    setInput(style === "format" ? JSON.stringify(validation.value, null, 2) : JSON.stringify(validation.value));
  };

  const jump = () => {
    if (validation.status !== "invalid" || !editor.current) return;
    const { offset, line, token } = validation.error;
    const el = editor.current;
    el.focus({ preventScroll: true });
    el.setSelectionRange(offset, offset + Math.max(token.length, 1));
    el.scrollTop = Math.max(0, (line - 1) * lineHeight - el.clientHeight / 3);
    el.closest("section")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-8">
      <Card tone="surface" className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <ValidatorStatusPill validation={validation} />
        <div className="flex flex-wrap items-center gap-3">
          <FileButton accept={jsonAccept} onText={setInput} variant="secondary" size="sm">
            <UploadIcon className="h-3.5 w-auto" /> Load File
          </FileButton>
          <Button size="sm" className="min-w-[160px] py-2.5" onClick={apply} disabled={validation.status !== "valid"} title={validation.status === "invalid" ? "Fix the error first" : undefined}>
            {style === "format" ? <AlignLeftIcon className="h-3.5 w-auto" /> : <CompressIcon className="h-3.5 w-auto" />}
            {style === "format" ? "Format JSON" : "Minify JSON"}
          </Button>
        </div>
      </Card>

      <Panel
        className="h-[420px] lg:h-[520px]"
        bodyClassName="flex flex-col overflow-hidden"
        header={
          <div className="flex items-center gap-4">
            <h2 className="flex items-center gap-2 text-sm leading-4 font-semibold text-heading">
              <CodeIcon className="h-3 w-auto text-brand" /> Input JSON
            </h2>
            <span aria-hidden className="h-4 w-px bg-border" />
            <SegmentedControl label="Output style" options={styles} value={style} onChange={setStyle} />
          </div>
        }
        actions={
          <>
            <Button variant="soft" size="tiny" onClick={() => copy(input)} disabled={!input} aria-label={copied ? "Copied" : "Copy JSON"}>
              {copied ? <CheckDoubleIcon className="h-[11px] w-auto text-success" /> : <CopyIcon className="size-[11px]" />}
            </Button>
            <Button variant="soft" size="tiny" onClick={() => setInput("")} disabled={!input} aria-label="Clear">
              <TrashIcon className="h-[11px] w-auto" />
            </Button>
          </>
        }
      >
        <DropZone onText={setInput} className="min-h-0 flex-1">
          <CodeEditor
            ref={editor}
            aria-label="JSON to validate"
            aria-invalid={validation.status === "invalid"}
            value={input}
            onChange={setInput}
            highlightLine={validation.status === "invalid" && input === text ? validation.error.line : undefined}
            onSelect={(e) => setCursor(positionToLineColumn(input, e.currentTarget.selectionStart))}
            placeholder="Paste JSON here, or drop a file…"
            className="text-muted/80 placeholder:text-muted/40"
          />
        </DropZone>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-background/50 px-4 py-2 font-mono text-[11px] text-muted">
          <span>
            Ln {cursor.line}, Col {cursor.column}
          </span>
          <span>{lines.toLocaleString()} lines</span>
          <span>{size}</span>
          <span className="ml-auto">RFC 8259</span>
        </div>
      </Panel>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_384px]">
        <div className="flex min-w-0 flex-col gap-6">
          <ValidatorResultCard
            validation={validation}
            canRepair={!!repaired?.ok}
            onJump={jump}
            onRepair={() => repaired?.ok && setInput(repaired.output)}
          />
          {validation.status === "invalid" && <ValidatorExplanationCard text={text} error={validation.error} explanation={validation.explanation} />}
        </div>
        <ValidatorStructureCard size={size} stats={validation.status === "valid" ? validation.stats : undefined} />
      </div>
    </div>
  );
}
