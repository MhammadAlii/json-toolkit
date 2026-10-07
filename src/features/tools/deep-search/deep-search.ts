import { describeParseError, parseJson } from "@/core/json/parse";
import { formatPath, isPlainObject, type PathSegment } from "@/core/json/path";

export type SearchOptions = { keys: boolean; values: boolean; caseSensitive: boolean; exact: boolean; regex: boolean };

export type SearchMatch = { path: string; on: "key" | "value"; value: unknown };

export type SearchResult = { ok: true; matches: SearchMatch[] } | { ok: false; error: string };

const defaults: SearchOptions = { keys: true, values: true, caseSensitive: false, exact: false, regex: false };

export function searchJson(input: string, query: string, options: Partial<SearchOptions> = {}): SearchResult {
  const parsed = parseJson(input);
  if (!parsed.ok) return { ok: false, error: describeParseError(parsed.error) };
  const opts = { ...defaults, ...options };
  if (query === "") return { ok: true, matches: [] };

  let hit: (text: string) => boolean;
  if (opts.regex) {
    let pattern: RegExp;
    try {
      pattern = new RegExp(opts.exact ? `^(?:${query})$` : query, opts.caseSensitive ? "" : "i");
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : `Invalid regular expression: ${String(e)}` };
    }
    hit = (text) => pattern.test(text);
  } else {
    const needle = opts.caseSensitive ? query : query.toLowerCase();
    hit = (text) => {
      const hay = opts.caseSensitive ? text : text.toLowerCase();
      return opts.exact ? hay === needle : hay.includes(needle);
    };
  }

  const matches: SearchMatch[] = [];
  const walk = (value: unknown, path: PathSegment[]) => {
    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, [...path, i]));
    } else if (isPlainObject(value)) {
      for (const [k, v] of Object.entries(value)) {
        if (opts.keys && hit(k)) matches.push({ path: formatPath([...path, k]), on: "key", value: v });
        walk(v, [...path, k]);
      }
    } else if (opts.values && hit(String(value))) {
      matches.push({ path: formatPath(path), on: "value", value });
    }
  };
  walk(parsed.value, []);
  return { ok: true, matches };
}
