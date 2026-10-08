"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { WandIcon } from "@/components/icons/wand";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { useSessionDraft } from "@/hooks/use-session-draft";
import { useStoredState } from "@/hooks/use-stored-state";
import { QueryPipeline } from "./query-pipeline";
import { QueryResultPanel } from "./query-result-panel";
import { defaultPipeline, runPipeline, samplePipeline, sampleSource, type Stage, type StageKind } from "./query-selector";

const panelHeight = "h-[360px] lg:h-[520px]";

export function QueryWorkspace() {
  const [source, setSource] = useSessionDraft("json-toolkit:query:source");
  const [stages, setStages] = useStoredState<Stage[]>("json-toolkit:query-pipeline-v2", defaultPipeline);
  const [focusId, setFocusId] = useState<string>();

  const deferredSource = useDeferredValue(source);
  const deferredStages = useDeferredValue(stages);
  const empty = deferredSource.trim() === "";
  const result = useMemo(() => runPipeline(deferredSource, deferredStages), [deferredSource, deferredStages]);

  const add = (kind: StageKind) => {
    const id = `${kind}-${Date.now().toString(36)}`;
    setStages([...stages, { id, kind, expr: "" }]);
    setFocusId(id);
  };

  return (
    <div className="flex flex-col gap-8">
      <QueryPipeline
        stages={stages}
        error={result.ok || empty ? undefined : result.stage !== undefined ? result.error : undefined}
        errorStage={result.ok || empty ? undefined : result.stage}
        focusId={focusId}
        onChange={(id, expr) => setStages(stages.map((s) => (s.id === id ? { ...s, expr } : s)))}
        onAdd={add}
        onRemove={(id) => setStages(stages.filter((s) => s.id !== id))}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title="Raw JSON Source"
          label="JSON source"
          value={source}
          onChange={setSource}
          loadLabel="Import"
          className={panelHeight}
          extraActions={
            <Button variant="soft" size="tiny" onClick={() => {
                setSource(sampleSource);
                setStages(samplePipeline);
              }}>
              <WandIcon className="h-[11px] w-auto" /> Sample
            </Button>
          }
        />
        <QueryResultPanel result={empty ? null : result} className={panelHeight} />
      </div>
    </div>
  );
}
