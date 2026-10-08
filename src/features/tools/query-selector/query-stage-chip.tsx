import { XmarkIcon } from "@/components/icons/xmark";
import { stageInfo, type Stage } from "./query-selector";

export function QueryStageChip({
  stage,
  invalid,
  autoFocus,
  onChange,
  onRemove,
}: {
  stage: Stage;
  invalid: boolean;
  autoFocus: boolean;
  onChange: (expr: string) => void;
  onRemove: () => void;
}) {
  const info = stageInfo[stage.kind];
  return (
    <div
      className={`flex h-[34px] max-w-full items-center rounded-lg border bg-surface pl-4 ${invalid ? "border-danger/70" : "border-border focus-within:border-brand/60"}`}
    >
      <span className="text-[10px] leading-[15px] font-bold tracking-[0.6px] text-brand">{info.label}</span>
      <span aria-hidden className="mx-3 h-4 w-px bg-border" />
      <input
        aria-label={`${info.label} expression`}
        aria-invalid={invalid}
        value={stage.expr}
        onChange={(e) => onChange(e.target.value)}
        placeholder={info.placeholder}
        autoFocus={autoFocus}
        spellCheck={false}
        size={Math.max(stage.expr.length, info.placeholder.length, 6)}
        className="min-w-0 bg-transparent font-mono text-xs leading-4 text-heading outline-none placeholder:text-muted/50"
      />
      <button type="button" onClick={onRemove} aria-label={`Remove ${info.label} stage`} className="flex h-full items-center px-3 text-muted hover:text-danger">
        <XmarkIcon className="h-2.5 w-auto" />
      </button>
    </div>
  );
}
