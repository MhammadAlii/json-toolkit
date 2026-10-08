import { isPlainObject, type PathSegment } from "@/core/json/path";
import { diffSequences, type DiffSequenceOptions } from "@/core/text/line-diff";

type PrettyLine = {
  text: string;
  head: string;
  tail: string;
  path: PathSegment[];
  /** A whole value on one line: a primitive, an inline array or an empty container. */
  leaf: boolean;
  items?: string[];
};

const isPrimitive = (v: unknown) => v === null || typeof v !== "object";

// Pretty-prints like JSON.stringify(v, null, 2), except arrays of plain values stay on one line
// so that editing one item shows up as a single changed row.
export function prettyLines(value: unknown): PrettyLine[] {
  const out: PrettyLine[] = [];
  const emit = (v: unknown, indent: string, key: string, comma: string, path: PathSegment[]) => {
    const head = `${indent}${key}`;
    if (Array.isArray(v) && v.every(isPrimitive)) {
      const items = v.map((item) => JSON.stringify(item));
      out.push({ text: `${head}[${items.join(", ")}]${comma}`, head, tail: comma, path, leaf: true, items });
    } else if (Array.isArray(v) || isPlainObject(v)) {
      const entries: [string, unknown, PathSegment][] = Array.isArray(v)
        ? v.map((item, i) => ["", item, i])
        : Object.entries(v).map(([k, item]) => [`${JSON.stringify(k)}: `, item, k]);
      const [open, close] = Array.isArray(v) ? ["[", "]"] : ["{", "}"];
      if (entries.length === 0) {
        out.push({ text: `${head}${open}${close}${comma}`, head, tail: comma, path, leaf: true });
        return;
      }
      out.push({ text: `${head}${open}`, head, tail: "", path, leaf: false });
      entries.forEach(([k, item, segment], i) => emit(item, `${indent}  `, k, i < entries.length - 1 ? "," : "", [...path, segment]));
      out.push({ text: `${indent}${close}${comma}`, head: indent, tail: comma, path, leaf: false });
    } else {
      out.push({ text: `${head}${JSON.stringify(v)}${comma}`, head, tail: comma, path, leaf: true });
    }
  };
  emit(value, "", "", "", []);
  return out;
}

export type Segment = { text: string; kind: "same" | "added" | "removed" };

export type DiffLine =
  | { kind: "same"; text: string; lineA: number; lineB: number; path: PathSegment[] }
  | { kind: "removed"; text: string; lineA: number; path: PathSegment[] }
  | { kind: "added"; text: string; lineB: number; path: PathSegment[] }
  | { kind: "modified"; text: string; lineA: number; lineB: number; path: PathSegment[]; segments: Segment[] };

// Long values make character diffs slow and unreadable, so they're shown as a whole replacement.
const maxCharDiff = 2000;

function coalesce(segments: Segment[]): Segment[] {
  const out: Segment[] = [];
  for (const s of segments) {
    const last = out[out.length - 1];
    if (last && last.kind === s.kind) last.text += s.text;
    else if (s.text) out.push({ ...s });
  }
  return out;
}

function valueSegments(before: string, after: string): Segment[] {
  const replace: Segment[] = [
    { text: before, kind: "removed" },
    { text: after, kind: "added" },
  ];
  if (before.length > maxCharDiff || after.length > maxCharDiff) return replace;
  const ops = diffSequences(Array.from(before), Array.from(after));
  const kept = ops.filter((o) => o.op === "equal").length;
  // Mostly-different values read better as old → new than as a scatter of single characters.
  if (kept < 0.4 * Math.max(before.length, after.length)) return replace;
  return coalesce(ops.map((o) => ({ text: o.text, kind: o.op === "equal" ? "same" : o.op === "insert" ? "added" : "removed" })));
}

function itemSegments(before: string[], after: string[]): Segment[] {
  const segments: Segment[] = [];
  diffSequences(before, after).forEach((op, i) => {
    if (i > 0) segments.push({ text: ", ", kind: "same" });
    segments.push({ text: op.text, kind: op.op === "equal" ? "same" : op.op === "insert" ? "added" : "removed" });
  });
  return segments;
}

// The same key holding a different one-line value becomes one row with the edit marked inline.
function mergeEdit(before: PrettyLine, after: PrettyLine, lineA: number, lineB: number): DiffLine | null {
  if (!before.leaf || !after.leaf || before.head !== after.head) return null;
  const inner = (l: PrettyLine) => l.text.slice(l.head.length, l.text.length - l.tail.length);
  const middle =
    before.items && after.items
      ? [{ text: "[", kind: "same" as const }, ...itemSegments(before.items, after.items), { text: "]", kind: "same" as const }]
      : valueSegments(inner(before), inner(after));
  const segments = coalesce([{ text: after.head, kind: "same" }, ...middle, { text: after.tail, kind: "same" }]);
  return { kind: "modified", text: after.text, lineA, lineB, path: after.path, segments };
}

/** Line-by-line view of two (normalized) documents. */
export function buildLineDiff(a: unknown, b: unknown, seq: DiffSequenceOptions = {}): DiffLine[] {
  const la = prettyLines(a);
  const lb = prettyLines(b);
  // Trailing commas depend on a line's position, so they're left out of the comparison.
  const bare = (l: PrettyLine) => l.text.slice(0, l.text.length - l.tail.length);
  const ops = diffSequences(la.map(bare), lb.map(bare), seq);

  const lines: DiffLine[] = [];
  let ia = 0;
  let ib = 0;
  for (let i = 0; i < ops.length; ) {
    if (ops[i].op === "equal") {
      lines.push({ kind: "same", text: lb[ib].text, lineA: ia + 1, lineB: ib + 1, path: lb[ib].path });
      ia++;
      ib++;
      i++;
      continue;
    }
    const removed: number[] = [];
    const added: number[] = [];
    for (; i < ops.length && ops[i].op !== "equal"; i++) {
      if (ops[i].op === "delete") removed.push(ia++);
      else added.push(ib++);
    }
    // Unmatched lines are grouped (all removals, then all additions) so replaced blocks stay readable.
    let pendingRemoved: number[] = [];
    let pendingAdded: number[] = [];
    const flush = () => {
      for (const r of pendingRemoved) lines.push({ kind: "removed", text: la[r].text, lineA: r + 1, path: la[r].path });
      for (const n of pendingAdded) lines.push({ kind: "added", text: lb[n].text, lineB: n + 1, path: lb[n].path });
      pendingRemoved = [];
      pendingAdded = [];
    };
    for (let j = 0; j < Math.max(removed.length, added.length); j++) {
      const r = removed[j];
      const n = added[j];
      const merged = r !== undefined && n !== undefined ? mergeEdit(la[r], lb[n], r + 1, n + 1) : null;
      if (merged) {
        flush();
        lines.push(merged);
      } else {
        if (r !== undefined) pendingRemoved.push(r);
        if (n !== undefined) pendingAdded.push(n);
      }
    }
    flush();
  }
  return lines;
}
