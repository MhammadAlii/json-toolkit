import { positionToLineColumn } from "./parse";

export type LooseFormat = {
  text: string;
  /** Where `markOffset` (an offset in the input) ended up in `text`; 1-based. */
  mark?: { line: number; column: number };
};

type Token = { start: number; end: number; kind: "open" | "close" | "comma" | "colon" | "comment" | "other" };

// Splits text into JSON-ish tokens without requiring it to be valid: strings in either quote style (an
// unterminated one runs to the end of its line), comments, punctuation and runs of anything else.
function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const start = i;
    if (c === '"' || c === "'") {
      i++;
      while (i < text.length && text[i] !== c && text[i] !== "\n") i += text[i] === "\\" ? 2 : 1;
      if (text[i] === c) i++;
      tokens.push({ start, end: Math.min(i, text.length), kind: "other" });
    } else if (c === "/" && (text[i + 1] === "/" || text[i + 1] === "*")) {
      const close = text[i + 1] === "/" ? text.indexOf("\n", i) : text.indexOf("*/", i + 2);
      i = close === -1 ? text.length : text[i + 1] === "/" ? close : close + 2;
      tokens.push({ start, end: i, kind: "comment" });
    } else if ("{[".includes(c)) {
      tokens.push({ start, end: ++i, kind: "open" });
    } else if ("}]".includes(c)) {
      tokens.push({ start, end: ++i, kind: "close" });
    } else if (c === ",") {
      tokens.push({ start, end: ++i, kind: "comma" });
    } else if (c === ":") {
      tokens.push({ start, end: ++i, kind: "colon" });
    } else {
      while (i < text.length && !/[\s{}[\],:"']/.test(text[i]) && !(text[i] === "/" && (text[i + 1] === "/" || text[i + 1] === "*"))) i++;
      // Always consume at least one character, so a lone "/" can't stall the scan.
      if (i === start) i++;
      tokens.push({ start, end: i, kind: "other" });
    }
  }
  return tokens;
}

/**
 * Indents text by its brackets and commas even when it isn't valid JSON, so the place where parsing
 * failed can be shown on its own line. Valid JSON comes out exactly as JSON.stringify(value, null, 2)
 * would write it. `markOffset` is an offset in `text` (usually where parsing failed) to locate in the result.
 */
export function looseFormat(text: string, markOffset?: number, indent = 2): LooseFormat {
  const tokens = tokenize(text);
  let out = "";
  let depth = 0;
  let markAt: number | undefined;
  const newline = () => {
    out += "\n" + " ".repeat(Math.max(depth, 0) * indent);
  };

  tokens.forEach((t, k) => {
    const prev = tokens[k - 1];
    if (t.kind === "close") {
      depth--;
      // An empty object or array stays on one line, as JSON.stringify writes it.
      if (prev && prev.kind !== "open") newline();
    } else if (prev && (prev.kind === "open" || prev.kind === "comma" || prev.kind === "comment")) {
      newline();
    } else if (prev && prev.kind === "colon") {
      out += " ";
    } else if (prev && t.kind !== "comma" && t.kind !== "colon") {
      // Two values in a row (a missing comma): keep them apart so the gap is visible.
      out += " ";
    }
    if (markOffset !== undefined && markAt === undefined && markOffset < t.end) {
      markAt = out.length + Math.max(markOffset - t.start, 0);
    }
    out += text.slice(t.start, t.end);
    if (t.kind === "open") depth++;
  });

  if (markOffset !== undefined && markAt === undefined) markAt = out.length;
  return { text: out, mark: markAt === undefined ? undefined : positionToLineColumn(out, markAt) };
}
