import { describeParseError, parseJson, type TransformResult } from "@/core/json/parse";

// Accepts the string with or without its outer quotes, and unwraps double-stringified input.
export function stringToJson(input: string): TransformResult {
  const trimmed = input.trim();
  if (trimmed === "") return { ok: false, error: "Input is empty." };
  const quoted = trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed : `"${trimmed}"`;

  let text: unknown;
  try {
    text = JSON.parse(quoted);
  } catch {
    return { ok: false, error: "This isn't a valid escaped string. Check for unescaped quotes or backslashes." };
  }

  for (let depth = 0; typeof text === "string" && depth < 3; depth++) {
    const parsed = parseJson(text);
    if (!parsed.ok) return { ok: false, error: `The unescaped text isn't valid JSON. ${describeParseError(parsed.error)}` };
    text = parsed.value;
  }
  return { ok: true, output: JSON.stringify(text, null, 2) };
}
