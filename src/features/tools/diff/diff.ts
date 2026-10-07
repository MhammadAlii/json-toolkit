import { describeParseError, parseJson } from "@/core/json/parse";
import { formatPath, isPlainObject, type PathSegment } from "@/core/json/path";

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
