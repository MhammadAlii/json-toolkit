import { fromParse, type TransformResult } from "@/core/json/parse";
import { sortDeep } from "@/core/json/sort";

export type Indent = "2" | "4" | "tab";

export function formatJson(input: string, indent: Indent = "2", sortKeys = false): TransformResult {
  return fromParse(input, (value) => ({
    ok: true,
    output: JSON.stringify(sortKeys ? sortDeep(value) : value, null, indent === "tab" ? "\t" : Number(indent)),
  }));
}
