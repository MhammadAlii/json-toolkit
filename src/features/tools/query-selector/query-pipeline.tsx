"use client";

import { PlusIcon } from "@/components/icons/plus";
import { Card } from "@/components/ui/card";
import { QueryStageChip } from "./query-stage-chip";
import { QueryStageMenu } from "./query-stage-menu";
import type { Stage, StageKind } from "./query-selector";

export function QueryPipeline({
  stages,
  error,
  errorStage,
  focusId,
  onChange,
  onAdd,
  onRemove,
}: {
  stages: Stage[];
  error?: string;
  errorStage?: number;
  focusId?: string;
  onChange: (id: string, expr: string) => void;
  onAdd: (kind: StageKind) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Card as="section" tone="surface" aria-label="Query pipeline" className="flex flex-col gap-6 border-brand/20 bg-brand/[0.03] p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xs leading-4 font-bold tracking-[0.6px] text-heading uppercase">Query Pipeline</h2>
        <QueryStageMenu
          onAdd={onAdd}
          trigger={({ open, toggle, id }) => (
            <button type="button" onClick={toggle} aria-expanded={open} aria-controls={id} className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand/80">
              <PlusIcon className="h-3 w-auto" /> Add Stage
            </button>
          )}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {stages.map((stage, i) => (
          <QueryStageChip
            key={stage.id}
            stage={stage}
            invalid={errorStage === i}
            autoFocus={stage.id === focusId}
            onChange={(expr) => onChange(stage.id, expr)}
            onRemove={() => onRemove(stage.id)}
          />
        ))}
        <QueryStageMenu
          onAdd={onAdd}
          trigger={({ open, toggle, id }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls={id}
              className="h-[34px] rounded-lg border border-dashed border-border px-4 text-xs text-muted hover:border-brand/50 hover:text-foreground"
            >
              Add stage (Path, Sort, Limit, Group...)
            </button>
          )}
        />
      </div>
      {error && (
        <p role="alert" className="-mt-2 font-mono text-xs text-danger">
          {error}
        </p>
      )}
    </Card>
  );
}
