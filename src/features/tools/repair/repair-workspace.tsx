"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { DownloadIcon } from "@/components/icons/download";
import { LightbulbIcon } from "@/components/icons/lightbulb";
import { WrenchIcon } from "@/components/icons/wrench";
import { JsonColorPicker } from "@/components/json/json-color-picker";
import { JsonInputPanel, toolPanelHeight } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { CopyIconButton } from "@/components/ui/copy-icon-button";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";
import { useDownload } from "@/hooks/use-download";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { allRules, repair, repairRules, type RepairOptions } from "./repair";
import { RepairAuditLog } from "./repair-audit-log";
import { RepairFixMenu } from "./repair-fix-menu";
import { RepairOutputView } from "./repair-output-view";

export function RepairWorkspace() {
  const [input, setInput] = useState("");
  const [stored, setOptions] = useStoredState<RepairOptions>("json-toolkit:repair-rules", allRules);
  // Saved options may predate a rule; new rules start on. Memoised on the JSON so the repair stays cached.
  const storedKey = JSON.stringify(stored);
  const options = useMemo<RepairOptions>(() => ({ ...allRules, ...(JSON.parse(storedKey) as Partial<RepairOptions>) }), [storedKey]);
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
        <JsonInputPanel title="Broken JSON" label="Broken JSON" value={input} onChange={setInput} />

        <div id="repaired-result" className="min-w-0">
          <Panel
            className={toolPanelHeight}
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
                <RepairFixMenu options={options} onChange={setOptions} />
                <span aria-hidden className="mx-1 h-4 w-px bg-border" />
                <JsonColorPicker colors={colors.colors} onChange={colors.setColor} onApply={colors.setAll} onReset={colors.reset} />
                <CopyIconButton text={output} label="Copy repaired JSON" />
                <Button variant="soft" size="tiny" onClick={() => download(output, "repaired.json")} disabled={!output} aria-label="Download repaired JSON">
                  <DownloadIcon className="size-[11px]" />
                </Button>
              </>
            }
          >
            {result.status === "empty" ? null : result.status === "blocked" ? (
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
