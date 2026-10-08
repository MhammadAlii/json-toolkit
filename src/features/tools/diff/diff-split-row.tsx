import type { SplitSide } from "./diff-view";
import { DiffSplitCell } from "./diff-split-cell";
import { activeRow } from "./diff-tones";

export function DiffSplitRow({ index, left, right, active }: { index: number; left?: SplitSide; right?: SplitSide; active: boolean }) {
  return (
    <div data-index={index} className={`grid grid-cols-2 divide-x divide-border/60 border-b border-border/40 ${active ? activeRow : ""}`}>
      <DiffSplitCell side={left} label="Original" />
      <DiffSplitCell side={right} label="Changed" />
    </div>
  );
}
