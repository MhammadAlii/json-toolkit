export type TransformResult = { ok: true; output: string; note?: string } | { ok: false; error: string };

export type ParseError = { message: string; line?: number; column?: number };

export function parseJson(input: string): { ok: true; value: unknown } | { ok: false; error: ParseError } {
  if (input.trim() === "") return { ok: false, error: { message: "Input is empty." } };
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const lineCol = /line (\d+) column (\d+)/.exec(raw);
    if (lineCol) {
      const message = raw.replace(/\s*\(line \d+ column \d+\)/, "").replace(/ at position \d+/, "");
      return { ok: false, error: { message, line: Number(lineCol[1]), column: Number(lineCol[2]) } };
    }
    const pos = /position (\d+)/.exec(raw);
    if (pos) {
      const { line, column } = positionToLineColumn(input, Number(pos[1]));
      return { ok: false, error: { message: raw, line, column } };
    }
    return { ok: false, error: { message: raw } };
  }
}

export function positionToLineColumn(text: string, position: number): { line: number; column: number } {
  const before = text.slice(0, position);
  const lines = before.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

export function describeParseError(error: ParseError): string {
  return error.line ? `Line ${error.line}, column ${error.column}: ${error.message}` : error.message;
}

export function fromParse<T>(input: string, fn: (value: unknown) => T): T | TransformResult {
  const parsed = parseJson(input);
  if (!parsed.ok) return { ok: false, error: describeParseError(parsed.error) };
  return fn(parsed.value);
}
