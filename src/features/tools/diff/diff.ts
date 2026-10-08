import { describeParseError, parseJson } from "@/core/json/parse";
import { formatPath, isPlainObject, type PathSegment } from "@/core/json/path";
import { sortDeep } from "@/core/json/sort";
import { diffSequences } from "@/core/text/line-diff";

export type DiffChange =
  | { kind: "added"; path: string; after: unknown }
  | { kind: "removed"; path: string; before: unknown }
  | { kind: "changed"; path: string; before: unknown; after: unknown };

export type DiffResult = { ok: true; changes: DiffChange[] } | { ok: false; error: string };

export function diffJson(left: string, right: string): DiffResult {
  const a = parseJson(left);
  if (!a.ok) return { ok: false, error: `Original: ${describeParseError(a.error)}` };
  const b = parseJson(right);
  if (!b.ok) return { ok: false, error: `Changed: ${describeParseError(b.error)}` };

  const changes: DiffChange[] = [];
  const walk = (x: unknown, y: unknown, path: PathSegment[]) => {
    if (Array.isArray(x) && Array.isArray(y)) {
      for (let i = 0; i < Math.max(x.length, y.length); i++) {
        if (i >= y.length) changes.push({ kind: "removed", path: formatPath([...path, i]), before: x[i] });
        else if (i >= x.length) changes.push({ kind: "added", path: formatPath([...path, i]), after: y[i] });
        else walk(x[i], y[i], [...path, i]);
      }
    } else if (isPlainObject(x) && isPlainObject(y)) {
      for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
        if (!(k in y)) changes.push({ kind: "removed", path: formatPath([...path, k]), before: x[k] });
        else if (!(k in x)) changes.push({ kind: "added", path: formatPath([...path, k]), after: y[k] });
        else walk(x[k], y[k], [...path, k]);
      }
    } else if (!Object.is(x, y)) {
      changes.push({ kind: "changed", path: formatPath(path), before: x, after: y });
    }
  };
  walk(a.value, b.value, []);
  return { ok: true, changes };
}

type PrettyLine = { text: string; head: string; items?: string[]; tail: string };

const isPrimitive = (v: unknown) => v === null || typeof v !== "object";

// Pretty-prints like JSON.stringify(v, null, 2), except arrays of plain values stay on one line
// so that editing one item shows up as a single changed row.
export function prettyLines(value: unknown): PrettyLine[] {
  const out: PrettyLine[] = [];
  const emit = (v: unknown, indent: string, key: string, comma: string) => {
    const head = `${indent}${key}`;
    if (Array.isArray(v) && v.every(isPrimitive)) {
      const items = v.map((item) => JSON.stringify(item));
      out.push({ text: `${head}[${items.join(", ")}]${comma}`, head, items, tail: comma });
    } else if (Array.isArray(v) || isPlainObject(v)) {
      const entries: [string, unknown][] = Array.isArray(v) ? v.map((item) => ["", item]) : Object.entries(v).map(([k, item]) => [`${JSON.stringify(k)}: `, item]);
      const [open, close] = Array.isArray(v) ? ["[", "]"] : ["{", "}"];
      if (entries.length === 0) {
        out.push({ text: `${head}${open}${close}${comma}`, head, tail: comma });
        return;
      }
      out.push({ text: `${head}${open}`, head, tail: "" });
      entries.forEach(([k, item], i) => emit(item, `${indent}  `, k, i < entries.length - 1 ? "," : ""));
      out.push({ text: `${indent}${close}${comma}`, head: indent, tail: comma });
    } else {
      out.push({ text: `${head}${JSON.stringify(v)}${comma}`, head, tail: comma });
    }
  };
  emit(value, "", "", "");
  return out;
}

export type Segment = { text: string; kind: "same" | "added" | "removed" };

export type DiffLine =
  | { kind: "same"; text: string; line: number }
  | { kind: "added" | "removed"; text: string }
  | { kind: "modified"; text: string; segments: Segment[] };

// An inline array edited in place becomes one row with its added and removed items marked.
function mergeArrayEdit(before: PrettyLine, after: PrettyLine): DiffLine | null {
  if (!before.items || !after.items || before.head !== after.head) return null;
  const segments: Segment[] = [{ text: `${after.head}[`, kind: "same" }];
  diffSequences(before.items, after.items).forEach((op, i) => {
    if (i > 0) segments.push({ text: ", ", kind: "same" });
    segments.push({ text: op.text, kind: op.op === "equal" ? "same" : op.op === "insert" ? "added" : "removed" });
  });
  segments.push({ text: `]${after.tail}`, kind: "same" });
  return { kind: "modified", text: after.text, segments };
}

export type LineDiffResult =
  | { ok: true; lines: DiffLine[]; counts: { added: number; removed: number; changed: number } }
  | { ok: false; error: string };

/** Line-by-line view of two documents, with keys sorted so reordering is never reported. */
export function diffJsonLines(left: string, right: string): LineDiffResult {
  const structural = diffJson(left, right);
  if (!structural.ok) return structural;
  const a = prettyLines(sortDeep((parseJson(left) as { value: unknown }).value));
  const b = prettyLines(sortDeep((parseJson(right) as { value: unknown }).value));

  const lines: DiffLine[] = [];
  let ia = 0;
  let ib = 0;
  // Trailing commas depend on a line's position, so they're left out of the comparison.
  const bare = (l: PrettyLine) => l.text.slice(0, l.text.length - l.tail.length);
  const ops = diffSequences(a.map(bare), b.map(bare));
  for (let i = 0; i < ops.length; ) {
    if (ops[i].op === "equal") {
      lines.push({ kind: "same", text: b[ib].text, line: ++ib });
      ia++;
      i++;
      continue;
    }
    const removed: PrettyLine[] = [];
    const added: PrettyLine[] = [];
    for (; i < ops.length && ops[i].op !== "equal"; i++) {
      if (ops[i].op === "delete") removed.push(a[ia++]);
      else added.push(b[ib++]);
    }
    for (let j = 0; j < Math.max(removed.length, added.length); j++) {
      const merged = removed[j] && added[j] ? mergeArrayEdit(removed[j], added[j]) : null;
      if (merged) lines.push(merged);
      else {
        if (removed[j]) lines.push({ kind: "removed", text: removed[j].text });
        if (added[j]) lines.push({ kind: "added", text: added[j].text });
      }
    }
  }

  const count = (kind: DiffChange["kind"]) => structural.changes.filter((c) => c.kind === kind).length;
  return { ok: true, lines, counts: { added: count("added"), removed: count("removed"), changed: count("changed") } };
}

export type DiffRow = { type: "line"; index: number; line: DiffLine } | { type: "gap"; from: number; to: number };

/** Keeps `context` unchanged lines around each change and folds longer unchanged runs. */
export function foldUnchanged(lines: DiffLine[], context = 3, expanded: ReadonlySet<number> = new Set()): DiffRow[] {
  const keep = lines.map((l) => l.kind !== "same");
  const near = lines.map((_, i) => keep.slice(Math.max(0, i - context), i + context + 1).some(Boolean));
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

const markers: Record<DiffLine["kind"], string> = { same: " ", added: "+", removed: "-", modified: "~" };

export function diffToText(lines: DiffLine[]): string {
  return lines
    .map((l) => {
      if (l.kind !== "modified") return `${markers[l.kind]} ${l.text}`;
      return `~ ${l.segments.map((s) => (s.kind === "added" ? `{+${s.text}+}` : s.kind === "removed" ? `[-${s.text}-]` : s.text)).join("")}`;
    })
    .join("\n");
}
