import type { TransformResult } from "@/core/json/parse";

// Lenient JSON repair: parses common mistakes (single quotes, unquoted keys, comments, missing or
// trailing commas, unclosed brackets, Python/JS literals…) and records every change it makes, with
// the input line and where the fix appears in the pretty-printed output.

export type RepairRule = "quotes" | "commas" | "brackets" | "comments" | "literals";

export const repairRules: { id: RepairRule; label: string; hint: string }[] = [
  { id: "quotes", label: "Quotes", hint: "Single quotes, backticks, unquoted keys and values" },
  { id: "commas", label: "Commas", hint: "Adds missing commas and colons, removes trailing ones" },
  { id: "brackets", label: "Brackets", hint: "Closes unclosed brackets and strings, removes stray ones" },
  { id: "comments", label: "Comments", hint: "Removes // and /* */ comments" },
  { id: "literals", label: "Literals", hint: "True, None, undefined, NaN, hex and other invalid numbers" },
];

export type RepairOptions = Record<RepairRule, boolean>;

export const allRules: RepairOptions = { quotes: true, commas: true, brackets: true, comments: true, literals: true };

export type RepairChange = {
  rule: RepairRule;
  title: string;
  /** 1-based line in the input. */
  line: number;
  before?: string;
  after?: string;
  note?: string;
  /** 1-based line in the repaired output where the fix shows. */
  outputLine?: number;
};

export type OutputToken = "key" | "string" | "number" | "boolean" | "null" | "punct" | "space";

export type OutputSegment = { text: string; type: OutputToken; changed: boolean };

export type RepairResult =
  | { status: "empty" }
  | { status: "repaired"; output: string; segments: OutputSegment[]; changes: RepairChange[] }
  | { status: "blocked"; rule: RepairRule; line: number; title: string };

type Tok =
  | { t: "str"; value: string; raw: string; quote: string; line: number; endLine: number; unterminated: boolean; control: boolean }
  | { t: "word"; raw: string; line: number }
  | { t: "punct"; raw: "{" | "}" | "[" | "]" | ":" | ","; line: number }
  | { t: "comment"; raw: string; line: number };

const ESCAPES: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", "/": "/", "\\": "\\", '"': '"', "'": "'", "`": "`" };

function tokenize(input: string): Tok[] {
  const tokens: Tok[] = [];
  let i = 0;
  let line = 1;
  const advance = (n: number) => {
    for (let k = 0; k < n; k++) if (input[i + k] === "\n") line++;
    i += n;
  };
  while (i < input.length) {
    const c = input[i];
    if (/\s/.test(c)) {
      advance(1);
    } else if (c === "/" && (input[i + 1] === "/" || input[i + 1] === "*")) {
      const start = i;
      const startLine = line;
      const end = input[i + 1] === "/" ? input.indexOf("\n", i) : input.indexOf("*/", i + 2);
      const stop = end === -1 ? input.length : input[i + 1] === "/" ? end : end + 2;
      advance(stop - i);
      tokens.push({ t: "comment", raw: input.slice(start, stop), line: startLine });
    } else if (c === '"' || c === "'" || c === "`") {
      const start = i;
      const startLine = line;
      let value = "";
      let control = false;
      let unterminated = false;
      advance(1);
      for (;;) {
        const d = input[i];
        // A line break usually means the closing quote is missing; backticks may span lines.
        if (d === undefined || (d === "\n" && c !== "`")) {
          unterminated = true;
          break;
        }
        if (d === c) {
          advance(1);
          break;
        }
        if (d === "\\" && i + 1 < input.length) {
          const e = input[i + 1];
          if (e === "u" && /^[0-9a-fA-F]{4}$/.test(input.slice(i + 2, i + 6))) {
            value += String.fromCharCode(parseInt(input.slice(i + 2, i + 6), 16));
            advance(6);
          } else {
            value += ESCAPES[e] ?? e;
            advance(2);
          }
        } else {
          if (d < " ") control = true;
          value += d;
          advance(1);
        }
      }
      tokens.push({ t: "str", value, raw: input.slice(start, i), quote: c, line: startLine, endLine: line, unterminated, control });
    } else if ("{}[]:,".includes(c)) {
      tokens.push({ t: "punct", raw: c as "{", line });
      advance(1);
    } else {
      const start = i;
      while (i < input.length && !/[\s{}[\]:,"'`]/.test(input[i]) && !(input[i] === "/" && /[/*]/.test(input[i + 1] ?? ""))) advance(1);
      tokens.push({ t: "word", raw: input.slice(start, i), line });
    }
  }
  return tokens;
}

type Mark = { changes?: RepairChange[] };

const marked = (...changes: RepairChange[]): Mark => ({ changes });

type Node = Mark &
  (
    | { k: "obj"; entries: Entry[]; close: Mark; endLine: number }
    | { k: "arr"; items: Item[]; close: Mark; endLine: number }
    | { k: "str"; value: string; endLine: number }
    | { k: "lit"; text: string; type: "number" | "boolean" | "null"; endLine: number }
  );

type Entry = { key: string; keyMark: Mark; colon: Mark; value: Node; comma: Mark };
type Item = { value: Node; comma: Mark };

class Blocked extends Error {
  readonly rule: RepairRule;
  readonly line: number;
  readonly title: string;

  constructor(rule: RepairRule, line: number, title: string) {
    super(title);
    this.rule = rule;
    this.line = line;
    this.title = title;
  }
}

const short = (s: string, n = 32) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

const literalFixes: Record<string, string> = {
  True: "true",
  False: "false",
  TRUE: "true",
  FALSE: "false",
  None: "null",
  NULL: "null",
  Null: "null",
  nil: "null",
  undefined: "null",
  NaN: "null",
  Infinity: "null",
  "-Infinity": "null",
};

// Numbers JavaScript accepts but JSON doesn't: hex/octal/binary, a leading + or ., a trailing ., leading zeros.
function normalizeNumber(raw: string): string | null {
  const m = /^([+-]?)(0[xob][\da-f]+|\d*\.?\d*(?:e[+-]?\d+)?)$/i.exec(raw);
  if (!m || !/\d/.test(m[2])) return null;
  const n = Number(m[2]);
  if (!Number.isFinite(n)) return null;
  return String(m[1] === "-" ? -n : n);
}

function parse(tokens: Tok[], options: RepairOptions, changes: RepairChange[]): Node {
  let p = 0;
  const lastLine = tokens.length ? tokens[tokens.length - 1].line : 1;

  const record = (change: RepairChange): RepairChange => {
    if (!options[change.rule]) throw new Blocked(change.rule, change.line, change.title);
    changes.push(change);
    return change;
  };

  // Comments are dropped wherever they appear.
  const peek = (): Tok | undefined => {
    while (tokens[p]?.t === "comment") {
      const c = tokens[p] as Extract<Tok, { t: "comment" }>;
      record({ rule: "comments", title: "Removed Comment", line: c.line, before: short(c.raw.replace(/\s+/g, " ")) });
      p++;
    }
    return tokens[p];
  };
  const isPunct = (tok: Tok | undefined, raw: string) => tok?.t === "punct" && tok.raw === raw;
  const startsValue = (tok: Tok | undefined) => !!tok && (tok.t === "str" || tok.t === "word" || isPunct(tok, "{") || isPunct(tok, "["));
  const missingValue = (line: number, note?: string): Node => {
    const change = record({ rule: "commas", title: "Added Missing Value", line, after: "null", note });
    return { k: "lit", text: "null", type: "null", endLine: line, ...marked(change) };
  };

  const string = (tok: Extract<Tok, { t: "str" }>, asKey: boolean): Mark => {
    const changes: RepairChange[] = [];
    if (tok.quote !== '"') {
      changes.push(record({
        rule: "quotes",
        title: tok.quote === "'" ? "Converted Single Quotes to Double Quotes" : "Converted Backticks to Double Quotes",
        line: tok.line,
        before: short(tok.raw),
        after: short(JSON.stringify(tok.value)),
      }));
    }
    if (tok.unterminated) {
      changes.push(record({ rule: "brackets", title: "Closed Unterminated String", line: tok.line, before: short(tok.raw), after: short(JSON.stringify(tok.value)) }));
    }
    if (tok.control && !asKey) {
      changes.push(record({ rule: "quotes", title: "Escaped Control Characters", line: tok.line, note: "Raw tabs or line breaks inside a string were escaped." }));
    }
    return { changes };
  };

  const word = (tok: Extract<Tok, { t: "word" }>): Node => {
    const raw = tok.raw;
    if (raw === "true" || raw === "false") return { k: "lit", text: raw, type: "boolean", endLine: tok.line };
    if (raw === "null") return { k: "lit", text: raw, type: "null", endLine: tok.line };
    if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(raw)) return { k: "lit", text: raw, type: "number", endLine: tok.line };
    if (raw in literalFixes) {
      const text = literalFixes[raw];
      const change = record({ rule: "literals", title: "Replaced Non-JSON Literal", line: tok.line, before: raw, after: text });
      return { k: "lit", text, type: text === "null" ? "null" : "boolean", endLine: tok.line, ...marked(change) };
    }
    const number = normalizeNumber(raw);
    if (number !== null) {
      const change = record({ rule: "literals", title: "Normalized Number", line: tok.line, before: raw, after: number });
      return { k: "lit", text: number, type: "number", endLine: tok.line, ...marked(change) };
    }
    const change = record({ rule: "quotes", title: "Quoted Unquoted Value", line: tok.line, before: short(raw), after: short(JSON.stringify(raw)) });
    return { k: "str", value: raw, endLine: tok.line, ...marked(change) };
  };

  const describe = (prev: Node, inArray: boolean) => {
    if (inArray) return "array item";
    if (prev.k === "obj" || prev.k === "arr") return "nested property";
    if (prev.k === "lit" && prev.type === "boolean") return "boolean value";
    if (prev.k === "lit" && prev.type === "null") return "null value";
    return "property value";
  };

  const closeMissing = (kind: "obj" | "arr", line: number): Mark =>
    marked(
      record({
      rule: "brackets",
      title: kind === "obj" ? "Closed Unclosed Object" : "Closed Unclosed Array",
      line,
        after: kind === "obj" ? "}" : "]",
        note: "at the end",
      }),
    );

  const value = (): Node => {
    const tok = peek();
    if (!tok) return missingValue(lastLine);
    if (isPunct(tok, "{")) return object();
    if (isPunct(tok, "[")) return array();
    if (tok.t === "str") {
      p++;
      return { k: "str", value: tok.value, endLine: tok.endLine, ...string(tok, false) };
    }
    if (tok.t === "word") {
      p++;
      return word(tok);
    }
    // A stray : , } or ] where a value belongs; the caller decides what to do with the token.
    return missingValue(tok.line, `Found ${tok.raw} where a value was expected.`);
  };

  const object = (): Node => {
    const open = tokens[p++];
    const entries: Entry[] = [];
    let endLine = open.line;
    for (;;) {
      let tok = peek();
      if (!tok) return { k: "obj", entries, close: closeMissing("obj", endLine), endLine };
      if (isPunct(tok, "}")) {
        p++;
        return { k: "obj", entries, close: {}, endLine: tok.line };
      }
      if (isPunct(tok, "]") || isPunct(tok, ":")) {
        record({ rule: tok.raw === "]" ? "brackets" : "commas", title: `Removed Unexpected ${tok.raw === "]" ? "Bracket" : "Colon"}`, line: tok.line, before: tok.raw });
        p++;
        continue;
      }
      if (isPunct(tok, ",")) {
        record({ rule: "commas", title: entries.length ? "Removed Extra Comma" : "Removed Leading Comma", line: tok.line, before: "," });
        p++;
        continue;
      }
      let key: string;
      const keyMark: Mark = {};
      const keyLine = tok.line;
      if (tok.t === "str") {
        Object.assign(keyMark, string(tok, true));
        key = tok.value;
        p++;
      } else if (tok.t === "word") {
        key = tok.raw;
        keyMark.changes = [record({ rule: "quotes", title: "Quoted Unquoted Key", line: tok.line, before: short(tok.raw), after: short(JSON.stringify(tok.raw)) })];
        p++;
      } else {
        // A value with no key, e.g. an object directly inside an object.
        key = `key${entries.length + 1}`;
        keyMark.changes = [record({ rule: "quotes", title: "Added Missing Key", line: tok.line, after: JSON.stringify(key) })];
      }
      tok = peek();
      const colon: Mark = {};
      if (isPunct(tok, ":")) {
        p++;
        tok = peek();
      } else if (startsValue(tok)) {
        colon.changes = [record({ rule: "commas", title: "Added Missing Colon", line: keyLine, after: ":", note: `after the key "${short(key, 24)}"` })];
      }
      const v = !tok || isPunct(tok, ",") || isPunct(tok, "}") ? missingValue(keyLine, `The key "${short(key, 24)}" had no value.`) : value();
      const entry: Entry = { key, keyMark, colon, value: v, comma: {} };
      entries.push(entry);
      endLine = v.endLine;
      tok = peek();
      if (isPunct(tok, ",")) {
        const comma = tok as Tok;
        p++;
        if (isPunct(peek(), "}")) record({ rule: "commas", title: "Removed Trailing Comma", line: comma.line, before: "," });
      } else if (startsValue(tok)) {
        entry.comma.changes = [record({ rule: "commas", title: "Added Missing Comma", line: v.endLine, after: ",", note: `after ${describe(v, false)}` })];
      }
    }
  };

  const array = (): Node => {
    const open = tokens[p++];
    const items: Item[] = [];
    let endLine = open.line;
    for (;;) {
      let tok = peek();
      if (!tok) return { k: "arr", items, close: closeMissing("arr", endLine), endLine };
      if (isPunct(tok, "]")) {
        p++;
        return { k: "arr", items, close: {}, endLine: tok.line };
      }
      if (isPunct(tok, "}") || isPunct(tok, ":")) {
        record({ rule: tok.raw === "}" ? "brackets" : "commas", title: `Removed Unexpected ${tok.raw === "}" ? "Bracket" : "Colon"}`, line: tok.line, before: tok.raw });
        p++;
        continue;
      }
      if (isPunct(tok, ",")) {
        record({ rule: "commas", title: items.length ? "Removed Extra Comma" : "Removed Leading Comma", line: tok.line, before: "," });
        p++;
        continue;
      }
      const v = value();
      const item: Item = { value: v, comma: {} };
      items.push(item);
      endLine = v.endLine;
      tok = peek();
      if (isPunct(tok, ",")) {
        const comma = tok as Tok;
        p++;
        if (isPunct(peek(), "]")) record({ rule: "commas", title: "Removed Trailing Comma", line: comma.line, before: "," });
      } else if (startsValue(tok)) {
        item.comma.changes = [record({ rule: "commas", title: "Added Missing Comma", line: v.endLine, after: ",", note: `after ${describe(v, true)}` })];
      }
    }
  };

  const skipStray = () => {
    for (let tok = peek(); tok && tok.t === "punct" && tok.raw !== "{" && tok.raw !== "["; tok = peek()) {
      record({ rule: "brackets", title: "Removed Unexpected Character", line: tok.line, before: tok.raw });
      p++;
    }
  };

  skipStray();
  const roots: Node[] = [value()];
  for (skipStray(); peek(); skipStray()) roots.push(value());
  if (roots.length === 1) return roots[0];
  const change = record({ rule: "brackets", title: "Wrapped Multiple Values in an Array", line: 1, note: `Found ${roots.length} top-level values.` });
  // The added brackets and the commas between the values all belong to this one fix.
  const mark = marked(change);
  return { k: "arr", items: roots.map((v) => ({ value: v, comma: mark })), close: mark, endLine: lastLine, ...mark };
}

function serialize(root: Node): { output: string; segments: OutputSegment[] } {
  const segments: OutputSegment[] = [];
  let line = 1;
  const push = (text: string, type: OutputToken, mark?: Mark) => {
    const changes = mark?.changes ?? [];
    for (const c of changes) c.outputLine ??= line;
    segments.push({ text, type, changed: changes.length > 0 });
    for (const ch of text) if (ch === "\n") line++;
  };
  const emit = (n: Node, indent: string) => {
    if (n.k === "str") return push(JSON.stringify(n.value), "string", n);
    if (n.k === "lit") return push(n.text, n.type, n);
    const [open, close] = n.k === "obj" ? ["{", "}"] : ["[", "]"];
    const children: (Entry | Item)[] = n.k === "obj" ? n.entries : n.items;
    push(open, "punct", n);
    if (children.length === 0) return push(close, "punct", n.close);
    const inner = `${indent}  `;
    children.forEach((child, i) => {
      push(`\n${inner}`, "space");
      if ("key" in child) {
        push(JSON.stringify(child.key), "key", child.keyMark);
        push(": ", "punct", child.colon);
        emit(child.value, inner);
      } else emit(child.value, inner);
      if (i < children.length - 1) push(",", "punct", child.comma);
    });
    push(`\n${indent}`, "space");
    push(close, "punct", n.close);
  };
  emit(root, "");
  return { output: segments.map((s) => s.text).join(""), segments };
}

export function repair(input: string, options: RepairOptions = allRules): RepairResult {
  if (input.trim() === "") return { status: "empty" };
  const changes: RepairChange[] = [];
  let text = input;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
    changes.push({ rule: "literals", title: "Removed Byte Order Mark", line: 1, note: "Removed the invisible U+FEFF character at the start." });
  }
  try {
    const { output, segments } = serialize(parse(tokenize(text), options, changes));
    return { status: "repaired", output, segments, changes };
  } catch (err) {
    if (err instanceof Blocked) return { status: "blocked", rule: err.rule, line: err.line, title: err.title };
    throw err;
  }
}

/** Repairs with every rule on, for callers that only need the fixed text. */
export function repairJson(input: string): TransformResult {
  const r = repair(input);
  if (r.status === "empty") return { ok: false, error: "Input is empty." };
  if (r.status === "blocked") return { ok: false, error: r.title };
  return { ok: true, output: r.output, note: r.changes.length ? `${r.changes.length} change(s) applied.` : "Already valid JSON. No repairs were needed." };
}
