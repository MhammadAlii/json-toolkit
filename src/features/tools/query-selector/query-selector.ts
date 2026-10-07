import type { TransformResult } from "@/core/json/parse";

// TODO: implement with an RFC 9535 JSONPath library (e.g. jsonpath-plus).
export function queryJson(_input: string, _path: string): TransformResult {
  return { ok: false, error: "JSONPath queries are coming soon." };
}
