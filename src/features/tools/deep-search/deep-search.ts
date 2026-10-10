import { formatPath, isPlainObject, type PathSegment } from "@/core/json/path";

export type SearchMode = "keys-values" | "keys" | "values" | "paths" | "all";
export type ValueTypeFilter = "any" | "string" | "number" | "boolean" | "null" | "object" | "array";
export type MatchKind = "key" | "value" | "path";

export type SearchOptions = {
  mode: SearchMode;
  caseSensitive: boolean;
  exact: boolean;
  regex: boolean;
  valueType: ValueTypeFilter;
  /** Deepest level to search; 0 means no limit. */
  maxDepth: number;
  /** Most results to return; 0 means no limit. */
  maxResults: number;
};

export const defaultSearchOptions: SearchOptions = {
  mode: "keys-values",
  caseSensitive: false,
  exact: false,
  regex: false,
  valueType: "any",
  maxDepth: 0,
  maxResults: 0,
};

export const searchModes: { value: SearchMode; label: string }[] = [
  { value: "keys-values", label: "Keys + Values" },
  { value: "keys", label: "Keys only" },
  { value: "values", label: "Values only" },
  { value: "paths", label: "Paths" },
  { value: "all", label: "Keys, Values + Paths" },
];

export type Range = [start: number, end: number];

export type SearchMatch = {
  kind: MatchKind;
  path: PathSegment[];
  /** `$.users[0].email` style path. */
  pointer: string;
  key: PathSegment | undefined;
  value: unknown;
  type: Exclude<ValueTypeFilter, "any">;
  depth: number;
  /** Where the query matched inside the key, the value text or the path. */
  ranges: Range[];
};

export type SearchResult =
  | { ok: true; matches: SearchMatch[]; nodesScanned: number; maxDepth: number; truncated: boolean; ms: number }
  | { ok: false; error: string };

export const valueType = (v: unknown): SearchMatch["type"] =>
  v === null ? "null" : Array.isArray(v) ? "array" : isPlainObject(v) ? "object" : (typeof v as "string" | "number" | "boolean");

// Scalars are compared as written in JSON, except strings, which are compared without their quotes.
export const valueText = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v));

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Builds the matcher for a query, or an error message for an invalid regular expression. */
function compile(query: string, o: SearchOptions): ((text: string) => Range[]) | string {
  const flags = o.caseSensitive ? "g" : "gi";
  let source = o.regex ? query : escapeRegex(query);
  if (o.exact) source = `^(?:${source})$`;
  let re: RegExp;
  try {
    re = new RegExp(source, `${flags}u`);
  } catch (err) {
    return `Invalid regular expression: ${err instanceof Error ? err.message.replace(/^Invalid regular expression: /, "") : String(err)}`;
  }
  return (text) => {
    const ranges: Range[] = [];
    re.lastIndex = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
      if (m[0] === "") {
        re.lastIndex++;
        if (o.exact) ranges.push([0, 0]);
        continue;
      }
      ranges.push([m.index, m.index + m[0].length]);
    }
    return ranges;
  };
}

/** Finds every key, value or path in `root` that matches `query`. */
export function deepSearch(root: unknown, query: string, o: SearchOptions = defaultSearchOptions): SearchResult {
  if (query === "") return { ok: true, matches: [], nodesScanned: 0, maxDepth: 0, truncated: false, ms: 0 };
  const match = compile(query, o);
  if (typeof match === "string") return { ok: false, error: match };

  const started = typeof performance !== "undefined" ? performance.now() : Date.now();
  const searchKeys = o.mode === "keys" || o.mode === "keys-values" || o.mode === "all";
  const searchValues = o.mode === "values" || o.mode === "keys-values" || o.mode === "all";
  const searchPaths = o.mode === "paths" || o.mode === "all";
  const matches: SearchMatch[] = [];
  let nodesScanned = 0;
  let maxDepth = 0;
  let truncated = false;

  // Depth-first, in document order, without recursion so deep documents can't overflow the stack.
  const stack: { value: unknown; path: PathSegment[] }[] = [{ value: root, path: [] }];
  while (stack.length) {
    const { value, path } = stack.pop()!;
    const depth = path.length;
    nodesScanned++;
    maxDepth = Math.max(maxDepth, depth);
    const type = valueType(value);
    const inDepth = o.maxDepth === 0 || depth <= o.maxDepth;
    const typeOk = o.valueType === "any" || o.valueType === type;

    if (inDepth && typeOk && !truncated) {
      const key = path[path.length - 1];
      const pointer = formatPath(path);
      const add = (kind: MatchKind, ranges: Range[]) => {
        if (o.maxResults && matches.length >= o.maxResults) {
          truncated = true;
          return;
        }
        matches.push({ kind, path, pointer, key, value, type, depth, ranges });
      };
      // A node matches at most once; a key match wins over a value or path match.
      const keyRanges = searchKeys && typeof key === "string" ? match(key) : [];
      const valueRanges = searchValues && type !== "object" && type !== "array" ? match(valueText(value)) : [];
      const pathRanges = searchPaths && depth > 0 ? match(pointer) : [];
      if (keyRanges.length) add("key", keyRanges);
      else if (valueRanges.length) add("value", valueRanges);
      else if (pathRanges.length) add("path", pathRanges);
    }

    if (Array.isArray(value)) for (let i = value.length - 1; i >= 0; i--) stack.push({ value: value[i], path: [...path, i] });
    else if (isPlainObject(value)) {
      const keys = Object.keys(value);
      for (let i = keys.length - 1; i >= 0; i--) stack.push({ value: value[keys[i]], path: [...path, keys[i]] });
    }
  }

  const ended = typeof performance !== "undefined" ? performance.now() : Date.now();
  return { ok: true, matches, nodesScanned, maxDepth, truncated, ms: ended - started };
}

/** Rows for exporting matches as CSV. */
export const matchRows = (matches: SearchMatch[]) =>
  matches.map((m) => ({ path: m.pointer, match: m.kind, type: m.type, value: m.type === "object" || m.type === "array" ? JSON.stringify(m.value) : valueText(m.value) }));
