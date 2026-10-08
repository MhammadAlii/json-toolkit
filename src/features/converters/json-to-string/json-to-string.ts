import { fromParse, type TransformResult } from "@/core/json/parse";

export function jsonToString(input: string, minify = true): TransformResult {
  return fromParse(input, (value) => ({
    ok: true,
    output: JSON.stringify(minify ? JSON.stringify(value) : JSON.stringify(value, null, 2)),
  }));
}
