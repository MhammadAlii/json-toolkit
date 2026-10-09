import { positionToLineColumn } from "@/core/json/parse";

// Strict RFC 8259 syntax check that pinpoints the first error and names its likely cause, so the
// message doesn't depend on which browser's JSON.parse produced it.

export type LintCode =
  | "EMPTY_INPUT"
  | "BOM"
  | "MISSING_COMMA"
  | "TRAILING_COMMA"
  | "MISSING_COLON"
  | "SINGLE_QUOTES"
  | "UNQUOTED_KEY"
  | "COMMENT"
  | "UNCLOSED_STRING"
  | "UNCLOSED_BRACKET"
  | "MISMATCHED_BRACKET"
  | "INVALID_LITERAL"
  | "INVALID_NUMBER"
  | "INVALID_ESCAPE"
  | "CONTROL_CHAR"
  | "TRAILING_DATA"
  | "UNEXPECTED_END"
  | "UNEXPECTED_TOKEN";

export type Location = { offset: number; line: number; column: number };

export type LintError = Location & {
  code: LintCode;
  /** The text found at the error, e.g. `"status"`, `}` or `True`. */
  token: string;
  /** The value just before a missing comma, e.g. `the closing brace of the "config" object`. */
  previous?: { description: string; line: number };
  /** Where the unclosed or mismatched object or array was opened. */
  opener?: Location & { char: "{" | "[" };
  /** Extra detail, e.g. which number rule was broken. */
  detail?: string;
};

export type LintResult = { ok: true } | { ok: false; error: LintError };

class Stop extends Error {
  readonly error: LintError;

  constructor(error: LintError) {
    super(error.code);
    this.error = error;
  }
}

type Done = { kind: "object" | "array" | "string" | "number" | "literal"; key?: string | number; end: number };

const isDigit = (c: string | undefined) => c !== undefined && c >= "0" && c <= "9";
const isWordStart = (c: string | undefined) => c !== undefined && /[A-Za-z_$]/.test(c);

export function lintJson(text: string): LintResult {
  if (text.trim() === "") return { ok: false, error: { code: "EMPTY_INPUT", token: "", offset: 0, line: 1, column: 1 } };
  let i = 0;
  const at = (offset: number): Location => ({ offset, ...positionToLineColumn(text, offset) });
  const stop = (code: LintCode, offset: number, extra: Partial<LintError> = {}): never => {
    throw new Stop({ code, token: extra.token ?? tokenAt(offset), ...at(offset), ...extra });
  };
  const tokenAt = (offset: number) => {
    const c = text[offset];
    if (c === undefined) return "";
    if (c === '"' || c === "'") {
      const end = text.indexOf(c, offset + 1);
      const line = text.indexOf("\n", offset);
      const stopAt = end === -1 || (line !== -1 && line < end) ? Math.min(offset + 20, line === -1 ? text.length : line) : end + 1;
      return text.slice(offset, Math.min(stopAt, offset + 40));
    }
    const word = /^[A-Za-z_$][\w$]*|^-?[\d.]+(?:[eE][+-]?\d+)?/.exec(text.slice(offset, offset + 40));
    return word ? word[0] : c;
  };

  const skip = () => {
    for (;;) {
      const c = text[i];
      if (c === " " || c === "\t" || c === "\n" || c === "\r") i++;
      else if (c === "/" && (text[i + 1] === "/" || text[i + 1] === "*")) stop("COMMENT", i, { token: text.slice(i, i + 2) });
      else return;
    }
  };

  const describe = (d: Done): string => {
    const owner = d.key === undefined ? "" : typeof d.key === "number" ? ` at index ${d.key}` : ` "${d.key}"`;
    if (d.kind === "object") return `the closing brace of the${owner} object`;
    if (d.kind === "array") return `the closing bracket of the${owner} array`;
    return d.key === undefined ? "the previous value" : typeof d.key === "number" ? `the item at index ${d.key}` : `the value of "${d.key}"`;
  };

  const string = (): number => {
    const start = i++;
    for (;;) {
      const c = text[i];
      if (c === undefined) stop("UNCLOSED_STRING", start);
      if (c === '"') return ++i;
      if (c === "\n" || c === "\r") stop("UNCLOSED_STRING", start);
      if (c < " ") stop("CONTROL_CHAR", i, { token: c === "\t" ? "\\t" : `U+${c.charCodeAt(0).toString(16).padStart(4, "0")}` });
      if (c === "\\") {
        const e = text[i + 1];
        if (e === "u") {
          if (!/^[\da-fA-F]{4}$/.test(text.slice(i + 2, i + 6))) stop("INVALID_ESCAPE", i, { token: text.slice(i, i + 6) });
          i += 6;
        } else if (e !== undefined && '"\\/bfnrt'.includes(e)) i += 2;
        else stop("INVALID_ESCAPE", i, { token: text.slice(i, i + 2) });
      } else i++;
    }
  };

  const number = (): number => {
    const start = i;
    if (text[i] === "-") i++;
    if (text[i] === "0") {
      i++;
      if (isDigit(text[i])) stop("INVALID_NUMBER", start, { detail: "leading-zero" });
    } else if (isDigit(text[i])) while (isDigit(text[i])) i++;
    else stop("INVALID_NUMBER", start, { detail: text[i] === "." ? "leading-dot" : "missing-digits" });
    if (text[i] === ".") {
      i++;
      if (!isDigit(text[i])) stop("INVALID_NUMBER", start, { detail: "trailing-dot" });
      while (isDigit(text[i])) i++;
    }
    if (text[i] === "e" || text[i] === "E") {
      i++;
      if (text[i] === "+" || text[i] === "-") i++;
      if (!isDigit(text[i])) stop("INVALID_NUMBER", start, { detail: "exponent" });
      while (isDigit(text[i])) i++;
    }
    if (/[xXbBoO]/.test(text[i] ?? "") && text.slice(start, i).replace("-", "") === "0") stop("INVALID_NUMBER", start, { detail: "radix" });
    return i;
  };

  const value = (key: string | number | undefined, depth: number): Done => {
    if (depth > 10_000) stop("UNEXPECTED_TOKEN", i, { detail: "too-deep" });
    skip();
    const c = text[i];
    if (c === undefined) stop("UNEXPECTED_END", i);
    if (c === "{") return object(key, depth);
    if (c === "[") return array(key, depth);
    if (c === '"') return { kind: "string", key, end: string() };
    if (c === "-" || isDigit(c)) return { kind: "number", key, end: number() };
    if (c === "+" || c === ".") stop("INVALID_NUMBER", i, { detail: c === "+" ? "plus" : "leading-dot" });
    if (c === "'") stop("SINGLE_QUOTES", i);
    if (isWordStart(c)) {
      const word = /^[A-Za-z_$][\w$]*/.exec(text.slice(i))![0];
      if (word === "true" || word === "false" || word === "null") {
        i += word.length;
        return { kind: "literal", key, end: i };
      }
      stop("INVALID_LITERAL", i, { token: word });
    }
    return stop("UNEXPECTED_TOKEN", i);
  };

  // After a member or item: a comma, the closing bracket, or an error explaining what's missing.
  const after = (close: "}" | "]", openAt: number, last: Done): boolean => {
    skip();
    const c = text[i];
    if (c === ",") {
      const comma = i++;
      skip();
      if (text[i] === close) stop("TRAILING_COMMA", comma, { token: "," });
      return true;
    }
    if (c === close) {
      i++;
      return false;
    }
    const opener = { ...at(openAt), char: close === "}" ? ("{" as const) : ("[" as const) };
    if (c === undefined) stop("UNCLOSED_BRACKET", openAt, { token: opener.char, opener });
    if (c === "}" || c === "]") stop("MISMATCHED_BRACKET", i, { opener });
    if (c === '"' || c === "{" || c === "[" || c === "'" || c === "-" || isDigit(c) || isWordStart(c)) {
      stop("MISSING_COMMA", i, { previous: { description: describe(last), line: positionToLineColumn(text, Math.max(last.end - 1, 0)).line } });
    }
    return stop("UNEXPECTED_TOKEN", i);
  };

  const object = (key: string | number | undefined, depth: number): Done => {
    const openAt = i++;
    skip();
    if (text[i] === "}") return { kind: "object", key, end: ++i };
    for (;;) {
      skip();
      const c = text[i];
      if (c === undefined) stop("UNCLOSED_BRACKET", openAt, { token: "{", opener: { ...at(openAt), char: "{" } });
      if (c === "'") stop("SINGLE_QUOTES", i);
      if (isWordStart(c) || isDigit(c)) stop("UNQUOTED_KEY", i);
      if (c !== '"') stop(c === "]" ? "MISMATCHED_BRACKET" : "UNEXPECTED_TOKEN", i, c === "]" ? { opener: { ...at(openAt), char: "{" } } : {});
      const keyStart = i;
      string();
      const name = JSON.parse(text.slice(keyStart, i)) as string;
      skip();
      if (text[i] !== ":") {
        if (text[i] === undefined) stop("UNCLOSED_BRACKET", openAt, { token: "{", opener: { ...at(openAt), char: "{" } });
        stop("MISSING_COLON", i, { previous: { description: `the key "${name}"`, line: positionToLineColumn(text, keyStart).line } });
      }
      i++;
      const member = value(name, depth + 1);
      if (!after("}", openAt, member)) return { kind: "object", key, end: i };
    }
  };

  const array = (key: string | number | undefined, depth: number): Done => {
    const openAt = i++;
    skip();
    if (text[i] === "]") return { kind: "array", key, end: ++i };
    for (let n = 0; ; n++) {
      skip();
      if (text[i] === undefined) stop("UNCLOSED_BRACKET", openAt, { token: "[", opener: { ...at(openAt), char: "[" } });
      if (text[i] === "}") stop("MISMATCHED_BRACKET", i, { opener: { ...at(openAt), char: "[" } });
      const item = value(n, depth + 1);
      if (!after("]", openAt, item)) return { kind: "array", key, end: i };
    }
  };

  try {
    if (text.charCodeAt(0) === 0xfeff) stop("BOM", 0, { token: "U+FEFF" });
    const root = value(undefined, 0);
    skip();
    if (i < text.length) stop("TRAILING_DATA", i, { previous: { description: describe(root), line: positionToLineColumn(text, Math.max(root.end - 1, 0)).line } });
    return { ok: true };
  } catch (err) {
    if (err instanceof Stop) return { ok: false, error: err.error };
    throw err;
  }
}
