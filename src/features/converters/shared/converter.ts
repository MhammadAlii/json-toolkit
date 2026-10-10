import { lintJson, type LintError } from "@/core/json/lint";
import { formatBytes } from "@/core/text/format-bytes";
import { explain } from "@/features/tools/validator/validator";

export type ParsedInput = { status: "empty" } | { status: "invalid"; error: string; lint: LintError } | { status: "valid"; value: unknown };

/** Strictly parses converter input, describing any syntax error the same way the Validator does. */
export function parseInput(text: string): ParsedInput {
  if (text.trim() === "") return { status: "empty" };
  const lint = lintJson(text);
  if (!lint.ok) {
    const e = explain(lint.error);
    return { status: "invalid", error: `${e.lead}${e.token ?? ""}${e.trail}`, lint: lint.error };
  }
  return { status: "valid", value: JSON.parse(text) as unknown };
}

export const byteSize = (text: string) => formatBytes(new TextEncoder().encode(text).length);
