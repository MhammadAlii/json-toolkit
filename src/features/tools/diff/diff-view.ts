import type { DiffLine, Segment } from "./diff-lines";

export type DiffRow = { type: "line"; index: number; line: DiffLine } | { type: "gap"; from: number; to: number };

/** Keeps `context` unchanged lines around each change and folds longer unchanged runs. */
export function foldUnchanged(lines: DiffLine[], context = 3, expanded: ReadonlySet<number> = new Set()): DiffRow[] {
  const changed = lines.map((l) => l.kind !== "same");
  const near = new Array<boolean>(lines.length).fill(false);
  changed.forEach((c, i) => {
    if (c) for (let k = Math.max(0, i - context); k <= Math.min(lines.length - 1, i + context); k++) near[k] = true;
  });
  const rows: DiffRow[] = [];
  for (let i = 0; i < lines.length; ) {
    if (near[i]) {
      rows.push({ type: "line", index: i, line: lines[i] });
      i++;
      continue;
    }
    let j = i;
    while (j < lines.length && !near[j]) j++;
    if (expanded.has(i) || j - i <= 1) for (let k = i; k < j; k++) rows.push({ type: "line", index: k, line: lines[k] });
    else rows.push({ type: "gap", from: i, to: j });
    i = j;
  }
  return rows;
}

export type Hunk = { start: number; end: number };

/** Runs of consecutive changed lines, used for next / previous change navigation. */
export function hunks(lines: DiffLine[]): Hunk[] {
  const out: Hunk[] = [];
  lines.forEach((l, i) => {
    if (l.kind === "same") return;
    const last = out[out.length - 1];
    if (last && last.end === i - 1) last.end = i;
    else out.push({ start: i, end: i });
  });
  return out;
}

export type SplitSide = { line: number; text: string; segments?: Segment[]; kind: DiffLine["kind"] };
export type SplitRow = { type: "pair"; index: number; left?: SplitSide; right?: SplitSide } | { type: "gap"; from: number; to: number };

const sideOf = (l: DiffLine, side: "left" | "right"): SplitSide | undefined => {
  if (l.kind === "same") return { line: side === "left" ? l.lineA : l.lineB, text: l.text, kind: "same" };
  if (l.kind === "modified") {
    const drop = side === "left" ? "added" : "removed";
    return { line: side === "left" ? l.lineA : l.lineB, text: l.text, kind: "modified", segments: l.segments.filter((s) => s.kind !== drop) };
  }
  if (l.kind === "removed") return side === "left" ? { line: l.lineA, text: l.text, kind: "removed" } : undefined;
  return side === "right" ? { line: l.lineB, text: l.text, kind: "added" } : undefined;
};

/** Side-by-side rows: removals sit next to the additions that replaced them. */
export function splitRows(rows: DiffRow[]): SplitRow[] {
  const out: SplitRow[] = [];
  for (let i = 0; i < rows.length; ) {
    const row = rows[i];
    if (row.type === "gap") {
      out.push(row);
      i++;
      continue;
    }
    if (row.line.kind === "same" || row.line.kind === "modified") {
      out.push({ type: "pair", index: row.index, left: sideOf(row.line, "left"), right: sideOf(row.line, "right") });
      i++;
      continue;
    }
    const removed: { index: number; line: DiffLine }[] = [];
    const added: { index: number; line: DiffLine }[] = [];
    for (; i < rows.length; i++) {
      const r = rows[i];
      if (r.type !== "line" || (r.line.kind !== "removed" && r.line.kind !== "added")) break;
      (r.line.kind === "removed" ? removed : added).push({ index: r.index, line: r.line });
    }
    for (let j = 0; j < Math.max(removed.length, added.length); j++) {
      out.push({
        type: "pair",
        index: (removed[j] ?? added[j]).index,
        left: removed[j] && sideOf(removed[j].line, "left"),
        right: added[j] && sideOf(added[j].line, "right"),
      });
    }
  }
  return out;
}

const markers: Record<DiffLine["kind"], string> = { same: " ", added: "+", removed: "-", modified: "~" };

export function diffToText(lines: DiffLine[]): string {
  return lines
    .map((l) => {
      if (l.kind !== "modified") return `${markers[l.kind]} ${l.text}`;
      return `~ ${l.segments.map((s) => (s.kind === "added" ? `{+${s.text}+}` : s.kind === "removed" ? `[-${s.text}-]` : s.text)).join("")}`;
    })
    .join("\n");
}
