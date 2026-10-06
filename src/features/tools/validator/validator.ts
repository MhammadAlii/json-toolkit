import { describeParseError, parseJson, type TransformResult } from "@/core/json/parse";

export function validateJson(input: string): TransformResult {
  const parsed = parseJson(input);
  if (!parsed.ok) return { ok: false, error: describeParseError(parsed.error) };
  const v = parsed.value;
  const kind = Array.isArray(v) ? `an array with ${v.length} item(s)` : v === null ? "null" : typeof v === "object" ? `an object with ${Object.keys(v as object).length} key(s)` : `a ${typeof v}`;
  return { ok: true, output: JSON.stringify(v, null, 2), note: `Valid JSON. The top-level value is ${kind}.` };
}
