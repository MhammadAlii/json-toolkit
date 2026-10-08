import { fromParse, type TransformResult } from "@/core/json/parse";

export type Indent = "2" | "4" | "tab";

export function formatJson(input: string, indent: Indent = "2", sortKeys = false): TransformResult {
  return fromParse(input, (value) => ({
    ok: true,
    output: JSON.stringify(sortKeys ? sortDeep(value) : value, null, indent === "tab" ? "\t" : Number(indent)),
  }));
}

export function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as object)
        .sort()
        .map((k) => [k, sortDeep((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}
