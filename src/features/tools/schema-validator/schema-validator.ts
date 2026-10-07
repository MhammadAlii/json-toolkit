import type { TransformResult } from "@/core/json/parse";

// TODO: implement with a JSON Schema library (e.g. Ajv, supports draft-07 / 2019-09 / 2020-12).
export function validateAgainstSchema(_schema: string, _data: string): TransformResult {
  return { ok: false, error: "JSON Schema validation is coming soon." };
}
