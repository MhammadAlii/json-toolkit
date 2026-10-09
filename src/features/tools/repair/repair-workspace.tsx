"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { CheckDoubleIcon } from "@/components/icons/check-double";
import { CopyIcon } from "@/components/icons/copy";
import { DownloadIcon } from "@/components/icons/download";
import { LightbulbIcon } from "@/components/icons/lightbulb";
import { ShieldCheckIcon } from "@/components/icons/shield-check";
import { WrenchIcon } from "@/components/icons/wrench";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";
import { useClipboard } from "@/hooks/use-clipboard";
import { useDownload } from "@/hooks/use-download";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { allRules, repair, repairRules, type RepairOptions } from "./repair";
import { RepairAuditLog } from "./repair-audit-log";
import { RepairOutputView } from "./repair-output-view";
import { RepairRulesCard } from "./repair-rules-card";
import { RepairStatusPill } from "./repair-status-pill";

const panelHeight = "h-[380px] lg:h-[560px]";

export function RepairWorkspace() {
  const [input, setInput] = useState("");
  const [options, setOptions] = useStoredState<RepairOptions>("json-toolkit:repair-rules", allRules);
  const [focusLine, setFocusLine] = useState<number>();
  const { copy, copied } = useClipboard();
  const download = useDownload();
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const result = useMemo(() => repair(text, options), [text, options]);
  const repaired = result.status === "repaired" ? result : null;
  const changes = repaired?.changes ?? [];

  const locate = (line: number) => {
    setFocusLine(line);
    document.getElementById("repaired-result")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-8">
      <Card tone="surface" className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <RepairStatusPill result={result} />
        <Button size="sm" className="min-w-[160px] py-2.5" onClick={() => repaired && setInput(repaired.output)} disabled={!repaired || changes.length === 0} title="Replace the broken JSON with the repaired result">
          <WrenchIcon className="h-3.5 w-auto" /> Apply Repair
        </Button>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <JsonInputPanel title="Broken JSON" label="Broken JSON" value={input} onChange={setInput} className={panelHeight} />
        <div id="repaired-result" className="min-w-0">
          <Panel
            className={panelHeight}
            bodyStyle={colors.style}
            header={<PanelTitle>Repaired Result</PanelTitle>}
            actions={
              <>
                <Button variant="soft" size="tiny" onClick={() => repaired && copy(repaired.output)} disabled={!repaired}>
                  {copied ? <CheckDoubleIcon className="h-[11px] w-auto text-success" /> : <CopyIcon className="size-[11px]" />}
                  {copied ? "Copied!" : "Copy Result"}
                </Button>
                <Button variant="soft" size="tiny" onClick={() => repaired && download(repaired.output, "repaired.json")} disabled={!repaired} aria-label="Download result">
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
                  Line {result.line} needs <strong className="text-heading">{repairRules.find((r) => r.id === result.rule)?.label}</strong> ({result.title.toLowerCase()}), which is
                  turned off.
                </p>
                <Button variant="secondary" size="xs" onClick={() => setOptions({ ...options, [result.rule]: true })}>
                  Enable {repairRules.find((r) => r.id === result.rule)?.label}
                </Button>
              </div>
            ) : (
              <RepairOutputView segments={result.segments} focusLine={focusLine} />
            )}
          </Panel>
        </div>
      </div>

      {repaired && changes.length > 0 && (
        <p className="flex items-start gap-3 rounded-xl border border-tint-amber/30 bg-tint-amber/5 px-4 py-4 text-sm leading-5 text-muted">
          <LightbulbIcon className="mt-0.5 h-4 w-auto shrink-0 text-tint-amber" />
          <span>
            <strong className="text-heading">Heads up:</strong> repairs are best guesses. Check the audit log before using the result, especially values that were quoted,
            replaced with null or wrapped in an array.
          </span>
        </p>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        {repaired && changes.length > 0 ? (
          <RepairAuditLog key={text} changes={changes} onLocate={locate} />
        ) : (
          <Card tone="surface" className="flex items-center gap-4 p-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
              <ShieldCheckIcon className="size-4" />
            </span>
            <p className="text-sm leading-5 text-muted">
              {repaired ? "This is already valid JSON, so nothing needed fixing." : "Paste broken JSON to see every change the repair makes, with its line."}
            </p>
          </Card>
        )}
        <RepairRulesCard options={options} changes={changes} onToggle={(rule) => setOptions({ ...options, [rule]: !options[rule] })} />
      </div>
    </div>
  );
}
