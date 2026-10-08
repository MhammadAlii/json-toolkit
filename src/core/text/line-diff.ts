export type DiffOp = { op: "equal" | "insert" | "delete"; text: string };

/** Myers diff of two string sequences: O((n + m) · d) time, so near-identical inputs stay fast. */
export function diffSequences(a: readonly string[], b: readonly string[]): DiffOp[] {
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const head = a.slice(0, start).map((text) => ({ op: "equal" as const, text }));
  const tail = a.slice(endA).map((text) => ({ op: "equal" as const, text }));
  return [...head, ...myers(a.slice(start, endA), b.slice(start, endB)), ...tail];
}

function myers(a: readonly string[], b: readonly string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const v = new Int32Array(2 * max + 2);
  const trace: Int32Array[] = [];

  outer: for (let d = 0; d <= max; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[max + k - 1] < v[max + k + 1]) ? v[max + k + 1] : v[max + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v[max + k] = x;
      if (x >= n && y >= m) break outer;
    }
  }

  const ops: DiffOp[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0 && (x > 0 || y > 0); d--) {
    const prev = trace[d];
    const k = x - y;
    const down = k === -d || (k !== d && prev[max + k - 1] < prev[max + k + 1]);
    const prevK = down ? k + 1 : k - 1;
    const prevX = prev[max + prevK];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      x--;
      y--;
      ops.push({ op: "equal", text: a[x] });
    }
    if (d === 0) break;
    if (down) ops.push({ op: "insert", text: b[--y] });
    else ops.push({ op: "delete", text: a[--x] });
  }
  return ops.reverse();
}
