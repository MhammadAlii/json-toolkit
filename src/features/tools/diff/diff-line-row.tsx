import type { DiffLine } from "./diff";

const rowTone: Record<DiffLine["kind"], string> = {
  same: "text-muted",
  added: "bg-success/10 text-success",
  removed: "bg-danger/10 text-danger",
  modified: "bg-tint-amber/10 text-heading",
};

const markerTone: Record<DiffLine["kind"], string> = {
  same: "text-muted/40",
  added: "text-success",
  removed: "text-danger",
  modified: "text-tint-amber",
};

const markers = { added: "+", removed: "-", modified: "~" } as const;

export function DiffLineRow({ line }: { line: DiffLine }) {
  return (
    <div className={`flex border-b border-border/40 font-mono text-sm leading-5 ${rowTone[line.kind]}`}>
      <span aria-hidden className={`w-12 shrink-0 py-1 pr-3 text-right text-xs leading-5 select-none ${markerTone[line.kind]}`}>
        {line.kind === "same" ? line.line : markers[line.kind]}
      </span>
      <span className="sr-only">{line.kind === "same" ? "" : `${line.kind}: `}</span>
      <span className="py-1 pr-4 pl-4 whitespace-pre">
        {line.kind === "modified"
          ? line.segments.map((s, i) =>
              s.kind === "same" ? (
                <span key={i}>{s.text}</span>
              ) : s.kind === "added" ? (
                <ins key={i} className="rounded-sm bg-success/25 px-0.5 text-success no-underline">
                  {s.text}
                </ins>
              ) : (
                <del key={i} className="rounded-sm bg-danger/25 px-0.5 text-danger">
                  {s.text}
                </del>
              ),
            )
          : line.text}
      </span>
    </div>
  );
}
