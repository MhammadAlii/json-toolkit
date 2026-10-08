import { formatPath } from "@/core/json/path";
import type { DiffLine } from "./diff-lines";
import { DiffSegments } from "./diff-segments";
import { activeRow, markers, markerTone, rowTone } from "./diff-tones";

export function DiffLineRow({ index, line, active }: { index: number; line: DiffLine; active: boolean }) {
  return (
    <div
      data-index={index}
      title={line.kind === "same" ? undefined : formatPath(line.path)}
      className={`flex border-b border-border/40 font-mono text-sm leading-5 ${rowTone[line.kind]} ${active ? activeRow : ""}`}
    >
      <span aria-hidden className={`w-12 shrink-0 py-1 pr-3 text-right text-xs leading-5 select-none ${markerTone[line.kind]}`}>
        {line.kind === "same" ? line.lineB : markers[line.kind]}
      </span>
      {line.kind !== "same" && <span className="sr-only">{`${line.kind} at ${formatPath(line.path)}: `}</span>}
      <span className="py-1 pr-4 pl-4 whitespace-pre">{line.kind === "modified" ? <DiffSegments segments={line.segments} /> : line.text}</span>
    </div>
  );
}
