"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import { CompressIcon } from "@/components/icons/compress";
import { TrashIcon } from "@/components/icons/trash";
import { WandIcon } from "@/components/icons/wand";
import { toolPanelHeight } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { CopyIconButton } from "@/components/ui/copy-icon-button";
import { DropZone } from "@/components/ui/drop-zone";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";
import { positionToLineColumn } from "@/core/json/parse";
import { formatBytes } from "@/core/text/format-bytes";
import { repairJson } from "@/features/tools/repair/repair";
import { validateJsonText } from "./validator";
import { ValidatorExplanationCard } from "./validator-explanation-card";
import { ValidatorResultCard } from "./validator-result-card";
import { ValidatorStructureCard } from "./validator-structure-card";

const lineHeight = 20;

export function ValidatorWorkspace() {
  const [input, setInput] = useState("");
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const editor = useRef<HTMLTextAreaElement>(null);

  const text = useDeferredValue(input);
  const validation = useMemo(() => validateJsonText(text), [text]);
  const repaired = useMemo(() => (validation.status === "invalid" ? repairJson(text) : null), [validation, text]);
  const size = formatBytes(new TextEncoder().encode(text).length);
  const valid = validation.status === "valid" ? validation : null;

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
      <Panel
        className={toolPanelHeight}
        bodyClassName="flex flex-col overflow-hidden"
        header={<PanelTitle>Input JSON</PanelTitle>}
        actions={
          <>
            <Button variant="accent" size="tiny" onClick={() => valid && setInput(JSON.stringify(valid.value, null, 2))} disabled={!valid}>
              <WandIcon className="h-[11px] w-auto" /> Format
            </Button>
            <Button variant="soft" size="tiny" onClick={() => valid && setInput(JSON.stringify(valid.value))} disabled={!valid}>
              <CompressIcon className="h-[11px] w-auto" /> Minify
            </Button>
            <span aria-hidden className="mx-1 h-4 w-px bg-border" />
            <CopyIconButton text={input} label="Copy JSON" />
            <Button variant="soft" size="tiny" onClick={() => setInput("")} disabled={!input}>
              <TrashIcon className="h-[11px] w-auto" /> Clear
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
            placeholder="Paste your JSON here…"
            className="text-muted/80 placeholder:text-muted/40"
          />
        </DropZone>
        {input && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-background/50 px-4 py-2 font-mono text-[11px] text-muted">
            <span>
              Ln {cursor.line}, Col {cursor.column}
            </span>
            <span>{input.split("\n").length.toLocaleString()} lines</span>
            <span>{size}</span>
            <span className="ml-auto">RFC 8259</span>
          </div>
        )}
      </Panel>

      {validation.status !== "empty" && (
        <div className={`grid items-start gap-8 ${valid ? "lg:grid-cols-[minmax(0,1fr)_384px]" : ""}`}>
          <div className="flex min-w-0 flex-col gap-6">
            <ValidatorResultCard validation={validation} canRepair={!!repaired?.ok} onJump={jump} onRepair={() => repaired?.ok && setInput(repaired.output)} />
            {validation.status === "invalid" && <ValidatorExplanationCard text={text} error={validation.error} explanation={validation.explanation} />}
          </div>
          {valid && <ValidatorStructureCard size={size} stats={valid.stats} />}
        </div>
      )}
    </div>
  );
}
