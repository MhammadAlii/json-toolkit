import { fromParse, type TransformResult } from "@/core/json/parse";

export function minifyJson(input: string): TransformResult {
  return fromParse(input, (value) => {
    const output = JSON.stringify(value);
    const saved = input.length - output.length;
    const pct = input.length ? Math.round((saved / input.length) * 100) : 0;
    return { ok: true, output, note: `Reduced from ${input.length} to ${output.length} characters (${pct}% smaller).` };
  });
}
