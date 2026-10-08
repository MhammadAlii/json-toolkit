import { describeParseError, parseJson } from "@/core/json/parse";
import { isPlainObject, type PathSegment } from "@/core/json/path";
import { sortDeep } from "@/core/json/sort";
import { diffSequences, type DiffSequenceOptions } from "@/core/text/line-diff";
import { buildLineDiff, type DiffLine } from "./diff-lines";

export type DiffOptions = { ignoreKeyOrder: boolean; ignoreArrayOrder: boolean; ignoreCase: boolean; ignoreWhitespace: boolean };

export const defaultDiffOptions: DiffOptions = { ignoreKeyOrder: true, ignoreArrayOrder: false, ignoreCase: false, ignoreWhitespace: false };

/** Options that change values, so a patch built from the normalized documents wouldn't reproduce B. */
export const isLossy = (o: DiffOptions) => o.ignoreArrayOrder || o.ignoreCase || o.ignoreWhitespace;

const canonical = (value: unknown) => JSON.stringify(value);

export function normalize(value: unknown, o: DiffOptions): unknown {
  if (typeof value === "string") {
    let s = o.ignoreWhitespace ? value.trim().replace(/\s+/g, " ") : value;
    if (o.ignoreCase) s = s.toLowerCase();
    return s;
  }
  if (Array.isArray(value)) {
    const items = value.map((item) => normalize(item, o));
    return o.ignoreArrayOrder ? items.map((item) => [canonical(item), item] as const).sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0)).map(([, item]) => item) : items;
  }
  if (isPlainObject(value)) {
    const out = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalize(v, o)]));
    return o.ignoreKeyOrder ? sortDeep(out) : out;
  }
  return value;
}

export type DiffChange =
  | { kind: "added"; path: PathSegment[]; pointer: string; after: unknown }
  | { kind: "removed"; path: PathSegment[]; pointer: string; before: unknown }
  | { kind: "changed"; path: PathSegment[]; pointer: string; before: unknown; after: unknown };

const escapePointer = (segment: PathSegment) => String(segment).replace(/~/g, "~0").replace(/\//g, "~1");

/**
 * Structural changes from A to B. Array items are matched by content, so inserting one item reports a
 * single addition instead of shifting every later index. `pointer` uses the index the item has at the
 * moment the change applies, so the changes in order form a valid JSON Patch.
 */
export function structuralChanges(a: unknown, b: unknown, seq: DiffSequenceOptions = {}): DiffChange[] {
  const changes: DiffChange[] = [];
  const walk = (x: unknown, y: unknown, path: PathSegment[], pointer: string) => {
    if (Array.isArray(x) && Array.isArray(y)) {
      const ops = diffSequences(x.map(canonical), y.map(canonical), seq);
      let ia = 0;
      let ib = 0;
      let at = 0;
      for (let i = 0; i < ops.length; ) {
        if (ops[i].op === "equal") {
          ia++;
          ib++;
          at++;
          i++;
          continue;
        }
        const removed: number[] = [];
        const added: number[] = [];
        for (; i < ops.length && ops[i].op !== "equal"; i++) {
          if (ops[i].op === "delete") removed.push(ia + removed.length);
          else added.push(ib + added.length);
        }
        let r = 0;
        let n = 0;
        // Each step applies at the current working index, so the pointers form a valid patch in order.
        for (const [mr, mn] of alignRun(removed.map((k) => x[k]), added.map((k) => y[k]))) {
          for (; r < mr; r++) changes.push({ kind: "removed", path: [...path, removed[r]], pointer: `${pointer}/${at}`, before: x[removed[r]] });
          for (; n < mn; n++) changes.push({ kind: "added", path: [...path, added[n]], pointer: `${pointer}/${at++}`, after: y[added[n]] });
          walk(x[removed[r]], y[added[n]], [...path, added[n]], `${pointer}/${at++}`);
          r++;
          n++;
        }
        for (; r < removed.length; r++) changes.push({ kind: "removed", path: [...path, removed[r]], pointer: `${pointer}/${at}`, before: x[removed[r]] });
        for (; n < added.length; n++) changes.push({ kind: "added", path: [...path, added[n]], pointer: `${pointer}/${at++}`, after: y[added[n]] });
        ia += removed.length;
        ib += added.length;
      }
    } else if (isPlainObject(x) && isPlainObject(y)) {
      for (const k of Object.keys(x)) {
        const p = `${pointer}/${escapePointer(k)}`;
        if (!(k in y)) changes.push({ kind: "removed", path: [...path, k], pointer: p, before: x[k] });
        else walk(x[k], y[k], [...path, k], p);
      }
      for (const k of Object.keys(y)) {
        if (!(k in x)) changes.push({ kind: "added", path: [...path, k], pointer: `${pointer}/${escapePointer(k)}`, after: y[k] });
      }
    } else if (canonical(x) !== canonical(y)) {
      changes.push({ kind: "changed", path, pointer, before: x, after: y });
    }
  };
  walk(a, b, [], "");
  return changes;
}

// How alike two values are, so an edited item is paired with its new version rather than a neighbour.
function similarity(x: unknown, y: unknown): number {
  if (isPlainObject(x) && isPlainObject(y)) {
    const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
    let same = 0;
    for (const k of keys) if (k in x && k in y) same += canonical(x[k]) === canonical(y[k]) ? 1 : 0.25;
    return keys.size === 0 ? 1 : same / keys.size;
  }
  if (Array.isArray(x) && Array.isArray(y)) return 0.5;
  return typeof x === typeof y && x !== null && y !== null ? 0.3 : 0;
}

// Large runs fall back to pairing by position to keep the alignment cheap.
const maxAlign = 60;

/** Order-preserving pairing of removed and added items that maximises their total similarity. */
function alignRun(removed: unknown[], added: unknown[]): [number, number][] {
  const n = removed.length;
  const m = added.length;
  if (n === 0 || m === 0) return [];
  if (n > maxAlign || m > maxAlign) return Array.from({ length: Math.min(n, m) }, (_, k) => [k, k]);
  const score = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const sim = removed.map((r) => added.map((a) => similarity(r, a)));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const pair = sim[i][j] > 0 ? sim[i][j] + score[i + 1][j + 1] : 0;
      score[i][j] = Math.max(pair, score[i + 1][j], score[i][j + 1]);
    }
  }
  const pairs: [number, number][] = [];
  for (let i = 0, j = 0; i < n && j < m; ) {
    if (sim[i][j] > 0 && score[i][j] === sim[i][j] + score[i + 1][j + 1]) pairs.push([i++, j++]);
    else if (score[i][j] === score[i + 1][j]) i++;
    else j++;
  }
  return pairs;
}

export type JsonPatchOp = { op: "add" | "remove" | "replace"; path: string; value?: unknown };

export function toJsonPatch(changes: DiffChange[]): JsonPatchOp[] {
  return changes.map((c) =>
    c.kind === "removed" ? { op: "remove", path: c.pointer } : { op: c.kind === "added" ? "add" : "replace", path: c.pointer, value: c.after },
  );
}

export type CompareResult =
  | {
      ok: true;
      lines: DiffLine[];
      changes: DiffChange[];
      counts: { added: number; removed: number; changed: number };
      /** The time budget ran out, so some regions are shown as whole removals and additions. */
      approximate: boolean;
    }
  | { ok: false; error: string };

/** Parses both documents once and produces the structural changes and the line view. */
export function compareJson(left: string, right: string, options: DiffOptions = defaultDiffOptions, deadline?: number): CompareResult {
  const a = parseJson(left);
  if (!a.ok) return { ok: false, error: `Original (A): ${describeParseError(a.error)}` };
  const b = parseJson(right);
  if (!b.ok) return { ok: false, error: `Changed (B): ${describeParseError(b.error)}` };

  let approximate = false;
  const seq: DiffSequenceOptions = { deadline, onTimeout: () => (approximate = true) };
  const x = normalize(a.value, options);
  const y = normalize(b.value, options);
  const changes = structuralChanges(x, y, seq);
  const lines = buildLineDiff(x, y, seq);
  const count = (kind: DiffChange["kind"]) => changes.filter((c) => c.kind === kind).length;
  return { ok: true, lines, changes, counts: { added: count("added"), removed: count("removed"), changed: count("changed") }, approximate };
}
