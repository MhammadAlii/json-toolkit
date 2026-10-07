import { describeParseError, parseJson } from "@/core/json/parse";
import { formatPath, isPlainObject, type PathSegment } from "@/core/json/path";

export type SearchOptions = { keys: boolean; values: boolean; caseSensitive: boolean; exact: boolean };

export type SearchMatch = { path: string; on: "key" | "value"; value: unknown };

export type SearchResult = { ok: true; matches: SearchMatch[] } | { ok: false; error: string };

const defaults: SearchOptions = { keys: true, values: true, caseSensitive: false, exact: false };

export function searchJson(input: string, query: string, options: Partial<SearchOptions> = {}): SearchResult {
  const parsed = parseJson(input);
  if (!parsed.ok) return { ok: false, error: describeParseError(parsed.error) };
  const opts = { ...defaults, ...options };
  if (query === "") return { ok: true, matches: [] };

  const needle = opts.caseSensitive ? query : query.toLowerCase();
  const hit = (text: string) => {
    const hay = opts.caseSensitive ? text : text.toLowerCase();
    return opts.exact ? hay === needle : hay.includes(needle);
  };

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
