import type { DiffLine } from "./diff-lines";

export const rowTone: Record<DiffLine["kind"], string> = {
  same: "text-muted",
  added: "bg-success/10 text-success",
  removed: "bg-danger/10 text-danger",
  modified: "bg-tint-amber/10 text-heading",
};

export const markerTone: Record<DiffLine["kind"], string> = {
  same: "text-muted/40",
  added: "text-success",
  removed: "text-danger",
  modified: "text-tint-amber",
};

export const markers = { added: "+", removed: "-", modified: "~" } as const;

export const activeRow = "shadow-[inset_3px_0_0_var(--color-brand)]";
