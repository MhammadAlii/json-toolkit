"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { DownloadIcon } from "@/components/icons/download";
import { LightbulbIcon } from "@/components/icons/lightbulb";
import { TrashIcon } from "@/components/icons/trash";
import { WrenchIcon } from "@/components/icons/wrench";
import { JsonColorPicker } from "@/components/json/json-color-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CodeEditor } from "@/components/ui/code-editor";
import { CopyIconButton } from "@/components/ui/copy-icon-button";
import { DropZone } from "@/components/ui/drop-zone";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";
import { useDownload } from "@/hooks/use-download";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { allRules, repair, repairRules, type RepairOptions } from "./repair";
import { RepairAuditLog } from "./repair-audit-log";
import { RepairOutputView } from "./repair-output-view";

// Same panel sizes and split as the home page formatter.
const panelHeight = "h-[360px] lg:h-[600px]";

export function RepairWorkspace() {
  const [input, setInput] = useState("");
  const [options, setOptions] = useStoredState<RepairOptions>("json-toolkit:repair-rules", allRules);
  const [focusLine, setFocusLine] = useState<number>();
  const download = useDownload();
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const result = useMemo(() => repair(text, options), [text, options]);
  const repaired = result.status === "repaired" ? result : null;
  const changes = repaired?.changes ?? [];
  const output = repaired?.output ?? "";

  const locate = (line: number) => {
    setFocusLine(line);
    document.getElementById("repaired-result")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]">
        <Panel
          className={panelHeight}
          header={<PanelTitle>Broken JSON</PanelTitle>}
          actions={
            <Button variant="soft" size="tiny" onClick={() => setInput("")} disabled={!input}>
              <TrashIcon className="h-[11px] w-auto" /> Clear
            </Button>
          }
        >
          <DropZone onText={setInput} className="h-full">
            <CodeEditor
              aria-label="Broken JSON"
              value={input}
              onChange={setInput}
              placeholder="Paste broken JSON here…"
              className="text-muted/80 placeholder:text-muted/40"
            />
          </DropZone>
        </Panel>

        <div id="repaired-result" className="min-w-0">
          <Panel
            className={panelHeight}
            bodyStyle={colors.style}
            header={<PanelTitle>Repaired Result</PanelTitle>}
            actions={
              <>
                <Button
                  variant={changes.length ? "accent" : "soft"}
                  size="tiny"
                  onClick={() => repaired && setInput(repaired.output)}
                  disabled={changes.length === 0}
                  title="Replace the broken JSON with the repaired result"
                >
                  <WrenchIcon className="h-[11px] w-auto" /> Repair
                </Button>
                <span aria-hidden className="mx-1 h-4 w-px bg-border" />
                <fieldset className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <legend className="sr-only">Repair rules</legend>
                  {repairRules.map((r) => (
                    <span key={r.id} title={r.hint}>
                      <Checkbox size="sm" label={r.label} checked={options[r.id]} onChange={(on) => setOptions({ ...options, [r.id]: on })} />
                    </span>
                  ))}
                </fieldset>
                <span aria-hidden className="mx-1 h-4 w-px bg-border" />
                <JsonColorPicker colors={colors.colors} onChange={colors.setColor} onReset={colors.reset} />
                <CopyIconButton text={output} label="Copy repaired JSON" />
                <Button variant="soft" size="tiny" onClick={() => download(output, "repaired.json")} disabled={!output} aria-label="Download repaired JSON">
                  <DownloadIcon className="size-[11px]" />
                </Button>
              </>
            }
          >
            {result.status === "empty" ? (
              <p className="p-4 font-mono text-sm leading-5 text-muted/60">Repaired JSON appears here.</p>
            ) : result.status === "blocked" ? (
              <div role="alert" className="flex flex-col items-start gap-3 p-4 text-sm leading-5 text-muted">
                <p>
                  Line {result.line} needs the <strong className="text-heading">{repairRules.find((r) => r.id === result.rule)?.label}</strong> rule (
                  {result.title.toLowerCase()}), which is turned off.
                </p>
                <Button variant="secondary" size="xs" onClick={() => setOptions({ ...options, [result.rule]: true })}>
                  Turn on {repairRules.find((r) => r.id === result.rule)?.label}
                </Button>
              </div>
            ) : (
              <RepairOutputView segments={result.segments} focusLine={focusLine} />
            )}
          </Panel>
        </div>
      </div>

      {changes.length > 0 && (
        <>
          <p className="flex items-start gap-3 rounded-xl border border-tint-amber/30 bg-tint-amber/5 px-4 py-4 text-sm leading-5 text-muted">
            <LightbulbIcon className="mt-0.5 h-4 w-auto shrink-0 text-tint-amber" />
            <span>
              <strong className="text-heading">Heads up:</strong> repairs are best guesses. Check the audit log before using the result, especially values that were quoted,
              replaced with null or wrapped in an array.
            </span>
          </p>
          <RepairAuditLog key={text} changes={changes} onLocate={locate} />
        </>
      )}
    </div>
  );
}
