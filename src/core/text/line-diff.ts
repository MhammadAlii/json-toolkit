export type DiffOp = { op: "equal" | "insert" | "delete"; text: string };

export type DiffSequenceOptions = {
  /** Epoch ms after which unresolved regions are reported as a plain delete + insert instead of a minimal diff. */
  deadline?: number;
  /** Set to true when the deadline cut the diff short. */
  onTimeout?: () => void;
};

/**
 * Minimal diff of two string sequences using Myers' linear-space algorithm: O((n + m) · d) time and
 * O(n + m) memory, so even completely different inputs can't exhaust memory.
 */
export function diffSequences(a: readonly string[], b: readonly string[], options: DiffSequenceOptions = {}): DiffOp[] {
  const inA = new Set(a);
  if (!b.some((item) => inA.has(item))) {
    return [...a.map((text) => ({ op: "delete" as const, text })), ...b.map((text) => ({ op: "insert" as const, text }))];
  }
  const out: DiffOp[] = [];
  diffRange(a, 0, a.length, b, 0, b.length, options, out);
  return out;
}

function diffRange(
  a: readonly string[],
  aLo: number,
  aHi: number,
  b: readonly string[],
  bLo: number,
  bHi: number,
  options: DiffSequenceOptions,
  out: DiffOp[],
) {
  while (aLo < aHi && bLo < bHi && a[aLo] === b[bLo]) {
    out.push({ op: "equal", text: a[aLo] });
    aLo++;
    bLo++;
  }
  let suffix = 0;
  while (aHi - suffix > aLo && bHi - suffix > bLo && a[aHi - 1 - suffix] === b[bHi - 1 - suffix]) suffix++;
  aHi -= suffix;
  bHi -= suffix;

  const timedOut = aLo < aHi && bLo < bHi && options.deadline !== undefined && Date.now() > options.deadline;
  if (timedOut) options.onTimeout?.();
  const split = aLo === aHi || bLo === bHi || timedOut ? null : middleSplit(a, aLo, aHi, b, bLo, bHi, options);
  if (split) {
    diffRange(a, aLo, aLo + split[0], b, bLo, bLo + split[1], options, out);
    diffRange(a, aLo + split[0], aHi, b, bLo + split[1], bHi, options, out);
  } else {
    for (let i = aLo; i < aHi; i++) out.push({ op: "delete", text: a[i] });
    for (let i = bLo; i < bHi; i++) out.push({ op: "insert", text: b[i] });
  }
  for (let i = 0; i < suffix; i++) out.push({ op: "equal", text: a[aHi + i] });
}

// Walks forward from the start and backward from the end until the paths overlap, returning the
// point where they meet, or null when the ranges share no items or the deadline passes.
function middleSplit(
  a: readonly string[],
  aLo: number,
  aHi: number,
  b: readonly string[],
  bLo: number,
  bHi: number,
  options: DiffSequenceOptions,
): [number, number] | null {
  const n = aHi - aLo;
  const m = bHi - bLo;
  const maxD = Math.ceil((n + m) / 2);
  const offset = maxD;
  const size = 2 * maxD + 2;
  const v1 = new Int32Array(size).fill(-1);
  const v2 = new Int32Array(size).fill(-1);
  v1[offset + 1] = 0;
  v2[offset + 1] = 0;
  const delta = n - m;
  const front = delta % 2 !== 0;
  let k1start = 0;
  let k1end = 0;
  let k2start = 0;
  let k2end = 0;

  for (let d = 0; d < maxD; d++) {
    if (options.deadline !== undefined && d % 64 === 0 && Date.now() > options.deadline) {
      options.onTimeout?.();
      return null;
    }
    for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      const k1o = offset + k1;
      let x1 = k1 === -d || (k1 !== d && v1[k1o - 1] < v1[k1o + 1]) ? v1[k1o + 1] : v1[k1o - 1] + 1;
      let y1 = x1 - k1;
      while (x1 < n && y1 < m && a[aLo + x1] === b[bLo + y1]) {
        x1++;
        y1++;
      }
      v1[k1o] = x1;
      if (x1 > n) k1end += 2;
      else if (y1 > m) k1start += 2;
      else if (front) {
        const k2o = offset + delta - k1;
        if (k2o >= 0 && k2o < size && v2[k2o] !== -1 && x1 >= n - v2[k2o]) return [x1, y1];
      }
    }
    for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      const k2o = offset + k2;
      let x2 = k2 === -d || (k2 !== d && v2[k2o - 1] < v2[k2o + 1]) ? v2[k2o + 1] : v2[k2o - 1] + 1;
      let y2 = x2 - k2;
      while (x2 < n && y2 < m && a[aHi - 1 - x2] === b[bHi - 1 - y2]) {
        x2++;
        y2++;
      }
      v2[k2o] = x2;
      if (x2 > n) k2end += 2;
      else if (y2 > m) k2start += 2;
      else if (!front) {
        const k1o = offset + delta - k2;
        if (k1o >= 0 && k1o < size && v1[k1o] !== -1) {
          const x1 = v1[k1o];
          if (x1 >= n - x2) return [x1, offset + x1 - k1o];
        }
      }
    }
  }
  return null;
}
