"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { JsonInputPanel, toolPanelHeight } from "@/components/tool/json-input-panel";
import { useStoredState } from "@/hooks/use-stored-state";
import { QueryPipeline } from "./query-pipeline";
import { QueryResultPanel } from "./query-result-panel";
import { defaultPipeline, runPipeline, type Stage, type StageKind } from "./query-selector";

export function QueryWorkspace() {
  const [source, setSource] = useState("");
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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]">
        <JsonInputPanel title="Raw JSON Source" label="JSON source" value={source} onChange={setSource} />
        <QueryResultPanel result={empty ? null : result} className={toolPanelHeight} />
      </div>
    </div>
  );
}
