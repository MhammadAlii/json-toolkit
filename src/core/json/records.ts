import { setKey } from "@/core/json/path";

export type RecordOptions = {
  /** Dot-path headers (`address.city`, `tags.0`) become nested objects and arrays, the reverse of flattening. */
  nested: boolean;
  /** What an empty cell becomes. */
  empty: "null" | "string" | "omit";
};

export type Records = { records: unknown[]; headers: string[]; notes: string[] };

// A header path as a tree: arrays are groups whose child segments are exactly 0, 1, 2, …
type Node = { header?: number; children: Map<string, Node>; array: boolean };

function headerNames(raw: unknown[], notes: Set<string>): string[] {
  const seen = new Map<string, number>();
  return raw.map((h, i) => {
    let name = h === null || h === undefined ? "" : String(h).trim();
    if (!name) {
      name = `column_${i + 1}`;
      notes.add("Columns without a header were named column_1, column_2, … by position.");
    }
    const n = seen.get(name) ?? 0;
    seen.set(name, n + 1);
    if (n) {
      notes.add(`Some headers repeat, so later ones get a number (e.g. ${name}_${n + 1}).`);
      name = `${name}_${n + 1}`;
    }
    return name;
  });
}

function buildTree(headers: string[], notes: Set<string>): Node {
  const root: Node = { children: new Map(), array: false };
  const all = new Set(headers);
  headers.forEach((h, i) => {
    const parts = h.split(".");
    // "a" and "a.b" can't both exist in one object, and empty segments (a..b) aren't paths, so those stay flat.
    const clash = parts.some((_, k) => k < parts.length - 1 && all.has(parts.slice(0, k + 1).join(".")));
    if (parts.length === 1 || parts.includes("") || clash) {
      if (clash) notes.add(`The headers ${JSON.stringify(h)} and ${JSON.stringify(h.slice(0, h.lastIndexOf(".")))} can't both be nested, so dotted ones were kept as flat keys.`);
      root.children.set(h, { header: i, children: new Map(), array: false });
      return;
    }
    let node = root;
    for (const part of parts) {
      let next = node.children.get(part);
      if (!next) node.children.set(part, (next = { children: new Map(), array: false }));
      node = next;
    }
    node.header = i;
  });
  const mark = (node: Node) => {
    const keys = [...node.children.keys()];
    node.array = node !== root && node.header === undefined && keys.length > 0 && keys.every((k, i) => k === String(i));
    node.children.forEach(mark);
  };
  mark(root);
  return root;
}

/** Turns a header row and data rows (from CSV or a spreadsheet) into JSON objects. */
export function rowsToRecords(headerRow: unknown[], rows: unknown[][], options: RecordOptions): Records {
  const notes = new Set<string>();
  const width = rows.reduce((n, r) => Math.max(n, r.length), headerRow.length);
  if (width > headerRow.length) notes.add("Some rows have more cells than there are headers; the extra cells are under column_N keys.");
  const headers = headerNames([...headerRow, ...Array<unknown>(width - headerRow.length).fill("")], notes);
  const empty = (v: unknown) => v === undefined || v === "";
  const cell = (row: unknown[], i: number) => (empty(row[i]) ? (options.empty === "null" ? null : options.empty === "string" ? "" : undefined) : row[i]);

  const tree = options.nested ? buildTree(headers, notes) : undefined;
  const fill = (node: Node, row: unknown[]): unknown => {
    if (node.header !== undefined) return cell(row, node.header);
    // An empty cell in an array column is a missing item, not a null one: [] is written as empty cells.
    if (node.array) return [...node.children.values()].filter((c) => c.header === undefined || !empty(row[c.header])).map((c) => fill(c, row)).filter((v) => v !== undefined);
    const obj: Record<string, unknown> = {};
    for (const [k, c] of node.children) {
      const v = fill(c, row);
      if (v !== undefined) setKey(obj, k, v);
    }
    return obj;
  };

  const records = rows.map((row) => {
    if (tree) return fill(tree, row);
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      const v = cell(row, i);
      if (v !== undefined) setKey(obj, h, v);
    });
    return obj;
  });
  return { records, headers, notes: [...notes] };
}
