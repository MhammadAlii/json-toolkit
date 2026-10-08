import type { Segment } from "./diff-lines";

export function DiffSegments({ segments }: { segments: Segment[] }) {
  return segments.map((s, i) =>
    s.kind === "same" ? (
      <span key={i}>{s.text}</span>
    ) : s.kind === "added" ? (
      <ins key={i} className="rounded-sm bg-success/25 px-px text-success no-underline">
        {s.text}
      </ins>
    ) : (
      <del key={i} className="rounded-sm bg-danger/25 px-px text-danger">
        {s.text}
      </del>
    ),
  );
}
