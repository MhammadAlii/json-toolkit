import type { SplitSide } from "./diff-view";
import { DiffSegments } from "./diff-segments";
import { markerTone, rowTone } from "./diff-tones";

export function DiffSplitCell({ side, label }: { side?: SplitSide; label: string }) {
  if (!side) return <div aria-hidden className="min-w-0 bg-surface-3/40" />;
  return (
    <div className={`flex min-w-0 font-mono text-sm leading-5 ${rowTone[side.kind]}`}>
      <span aria-hidden className={`w-10 shrink-0 py-1 pr-2 text-right text-xs leading-5 select-none ${markerTone[side.kind]}`}>
        {side.line}
      </span>
      {side.kind !== "same" && <span className="sr-only">{`${label} ${side.kind}: `}</span>}
      <span className="min-w-0 overflow-hidden py-1 pr-3 pl-3 text-ellipsis whitespace-pre" title={side.text}>
        {side.segments ? <DiffSegments segments={side.segments} /> : side.text}
      </span>
    </div>
  );
}
