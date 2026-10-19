import type { TransformResult } from "@/core/json/parse";

// Lenient JSON repair: parses common mistakes (single quotes, unquoted keys, comments, missing or
// trailing commas, unclosed brackets, Python/JS literals…) and records every change it makes, with
// the input line and where the fix appears in the pretty-printed output.

export type RepairRule = "quotes" | "commas" | "brackets" | "comments" | "literals" | "extras";

export const repairRules: { id: RepairRule; label: string; hint: string }[] = [
  { id: "quotes", label: "Quotes", hint: "Single quotes, backticks, unquoted keys and values" },
  { id: "commas", label: "Commas", hint: "Adds missing commas and colons, removes trailing ones" },
  { id: "brackets", label: "Brackets", hint: "Closes unclosed brackets and strings, removes stray ones" },
  { id: "comments", label: "Comments", hint: "Removes // and /* */ comments" },
  { id: "literals", label: "Literals", hint: "True, None, undefined, NaN, hex and other invalid numbers" },
  { id: "extras", label: "Extra text", hint: "Code fences, text or code around the JSON, wrappers like ObjectId() and … placeholders" },
];

export type RepairOptions = Record<RepairRule, boolean>;

export const allRules: RepairOptions = { quotes: true, commas: true, brackets: true, comments: true, literals: true, extras: true };

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
  | {
      t: "str";
      value: string;
      raw: string;
      quote: string;
      line: number;
      endLine: number;
      unterminated: boolean;
      control: boolean;
      /** A backslash that isn't a JSON escape, kept as a literal backslash. */
      badEscape: boolean;
      /** A quote inside the string that should have been escaped. */
      innerQuote: boolean;
    }
  | { t: "word"; raw: string; line: number }
  | { t: "punct"; raw: "{" | "}" | "[" | "]" | ":" | ","; line: number }
  | { t: "comment"; raw: string; line: number };

const ESCAPES: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", "/": "/", "\\": "\\", '"': '"', "'": "'", "`": "`" };

// Curly quotes from word processors and notes apps, mapped to the characters that may close them.
const SMART_QUOTES: Record<string, string> = { "“": "”“", "”": "”“", "‘": "’‘", "’": "’‘" };

function tokenize(input: string): Tok[] {
  const tokens: Tok[] = [];
  let i = 0;
  let line = 1;
  const advance = (n: number) => {
    for (let k = 0; k < n; k++) if (input[i + k] === "\n") line++;
    i += n;
  };
  const nextNonSpace = (from: number) => {
    let k = from;
    while (k < input.length && (input[k] === " " || input[k] === "\t" || input[k] === "\r")) k++;
    return k;
  };
  // After a closing quote, JSON can only continue with a delimiter, a line break or the end.
  const endsValue = (k: number) => k >= input.length || ",}]\n".includes(input[k]);
  // Finds a later quote that properly ends the string, within `lines` line breaks, and returns its index
  // (or -1). A quote followed by a colon starts a key instead, so the string really did end there.
  const laterCloser = (from: number, closers: string, lines: number) => {
    for (let j = from; j < input.length; j++) {
      if (input[j] === "\n" && --lines < 0) return -1;
      if (input[j] === "\\") {
        j++;
        continue;
      }
      if (!closers.includes(input[j])) continue;
      const k = nextNonSpace(j + 1);
      if (input[k] === ":") return -1;
      if (endsValue(k)) return j;
    }
    return -1;
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
    } else if (c === '"' || c === "'" || c === "`" || c in SMART_QUOTES) {
      const start = i;
      const startLine = line;
      const closers = SMART_QUOTES[c] ?? c;
      let value = "";
      let control = false;
      let unterminated = false;
      let badEscape = false;
      let innerQuote = false;
      // Once the real closing quote is known, quotes and line breaks before it need no more look-ahead,
      // which keeps long lines full of quotes linear.
      let closesAt = -1;
      const continuesTo = (lines: number) => {
        if (closesAt > i) return true;
        closesAt = laterCloser(i + 1, closers, lines);
        return closesAt > i;
      };
      advance(1);
      for (;;) {
        const d = input[i];
        if (d === undefined) {
          unterminated = true;
          break;
        }
        // A line break usually means the closing quote is missing, unless the string clearly carries on
        // and ends on a following line. Backticks may always span lines.
        if (d === "\n" && c !== "`" && !continuesTo(5)) {
          unterminated = true;
          break;
        }
        if (closers.includes(d)) {
          // A quote followed by more text on the same line, with a proper closing quote later, is a quote
          // inside the string that should have been escaped: "He said "hi" to me".
          const k = nextNonSpace(i + 1);
          const next = input[k];
          const inner =
            closesAt > i || (!endsValue(k) && next !== ":" && !`"'\`{[/`.includes(next) && !(next in SMART_QUOTES) && continuesTo(0));
          if (inner) {
            innerQuote = true;
            value += d;
            advance(1);
            continue;
          }
          advance(1);
          break;
        }
        if (d === "\\" && i + 1 < input.length) {
          const e = input[i + 1];
          if (e === "u" && /^[0-9a-fA-F]{4}$/.test(input.slice(i + 2, i + 6))) {
            value += String.fromCharCode(parseInt(input.slice(i + 2, i + 6), 16));
            advance(6);
          } else if (e in ESCAPES) {
            value += ESCAPES[e];
            advance(2);
          } else {
            // Not a JSON escape, as in a Windows path (C:\Users): keep the backslash as a character.
            badEscape = true;
            value += "\\";
            advance(1);
          }
        } else {
          if (d < " ") control = true;
          value += d;
          advance(1);
        }
      }
      if (unterminated) {
        // With the closing quote missing, the string ran on to the end of the line or the input and took the
        // brackets that close its object or array with it ({"key": "text.}). Hand them back as brackets.
        let back = i;
        while (back > start + 1 && /[\s}\]]/.test(input[back - 1])) back--;
        while (back < i && /\s/.test(input[back])) back++;
        if (back < i && /[}\]]/.test(input.slice(back, i))) {
          value = value.slice(0, value.length - (i - back)).trimEnd();
          for (let k = back; k < i; k++) if (input[k] === "\n") line--;
          i = back;
        }
      }
      tokens.push({ t: "str", value, raw: input.slice(start, i), quote: c, line: startLine, endLine: line, unterminated, control, badEscape, innerQuote });
    } else if ("{}[]:,".includes(c)) {
      tokens.push({ t: "punct", raw: c as "{", line });
      advance(1);
    } else {
      const start = i;
      while (i < input.length && !/[\s{}[\]:,"'`“”‘’]/.test(input[i]) && !(input[i] === "/" && /[/*]/.test(input[i + 1] ?? ""))) advance(1);
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

const isPlaceholder = (raw: string) => raw === "..." || raw === "…";

// A word that would become a string: not a literal, number, placeholder or function call.
function isBareText(raw: string): boolean {
  if (raw === "true" || raw === "false" || raw === "null" || raw in literalFixes || isPlaceholder(raw)) return false;
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(raw) || normalizeNumber(raw) !== null) return false;
  return !/\(/.test(raw) && !raw.startsWith(")");
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
        title: tok.quote === "'" ? "Converted Single Quotes to Double Quotes" : tok.quote === "`" ? "Converted Backticks to Double Quotes" : "Converted Smart Quotes to Double Quotes",
        line: tok.line,
        before: short(tok.raw),
        after: short(JSON.stringify(tok.value)),
      }));
    }
    if (tok.unterminated) {
      changes.push(record({ rule: "brackets", title: "Closed Unterminated String", line: tok.line, before: short(tok.raw), after: short(JSON.stringify(tok.value)) }));
    }
    if (tok.innerQuote) {
      changes.push(record({ rule: "quotes", title: "Escaped Quotes Inside a String", line: tok.line, before: short(tok.raw), after: short(JSON.stringify(tok.value)) }));
    }
    if (tok.badEscape) {
      changes.push(record({ rule: "quotes", title: "Escaped Backslashes", line: tok.line, note: "A backslash that isn't a JSON escape (as in C:\\Users) was kept as a backslash." }));
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
    const call = /^([A-Za-z_$][\w$.]*)\(([^()]*)\)$/.exec(raw);
    if (call) {
      const inner = call[2].trim();
      const unwrapped: Node = inner === "" ? { k: "lit", text: "null", type: "null", endLine: tok.line } : word({ t: "word", raw: inner, line: tok.line });
      const change = record({ rule: "extras", title: "Unwrapped Function Call", line: tok.line, before: short(raw), after: short(inner || "null") });
      return { ...unwrapped, changes: [...(unwrapped.changes ?? []), change] };
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
    if (tok.t === "word" && tok.raw === "new" && tokens[p + 1]?.t === "word" && /\($/.test((tokens[p + 1] as { raw: string }).raw)) {
      p++;
      return value();
    }
    // A call wrapped around a value: ObjectId("…"), ISODate("…"), or JSONP's callback({…}).
    if (tok.t === "word" && /^[A-Za-z_$][\w$.]*\($/.test(tok.raw)) {
      p++;
      const inner = value();
      const close = peek();
      if (close?.t === "word" && close.raw.startsWith(")")) p++;
      const change = record({ rule: "extras", title: "Unwrapped Function Call", line: tok.line, before: `${tok.raw}…)`, note: "Kept only the value inside." });
      return { ...inner, changes: [...(inner.changes ?? []), change] };
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
      if (tok.t === "word" && isPlaceholder(tok.raw)) {
        record({ rule: "extras", title: "Removed Placeholder", line: tok.line, before: tok.raw });
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
      let v: Node;
      if (!tok || isPunct(tok, ",") || isPunct(tok, "}")) {
        v = missingValue(keyLine, `The key "${short(key, 24)}" had no value.`);
      } else if (tok.t === "word" && isBareText(tok.raw) && tokens[p + 1]?.t === "word" && tokens[p + 1].line === tok.line) {
        // Unquoted text with spaces, like {city: New York}: the words up to the next comma are one value.
        const first = tok;
        const words = [first.raw];
        let j = p + 1;
        for (let next = tokens[j]; next?.t === "word" && next.line === first.line && isBareText(next.raw) && !isPunct(tokens[j + 1], ":"); next = tokens[++j]) words.push(next.raw);
        p = j;
        const text = words.join(" ");
        const change = record({ rule: "quotes", title: "Quoted Unquoted Value", line: first.line, before: short(text), after: short(JSON.stringify(text)) });
        v = { k: "str", value: text, endLine: first.line, ...marked(change) };
      } else {
        v = value();
      }
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
      if (tok.t === "word" && isPlaceholder(tok.raw)) {
        record({ rule: "extras", title: "Removed Placeholder", line: tok.line, before: tok.raw });
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

  // Returns the changes it recorded, so they can be dropped along with surrounding text.
  const skipStray = (): RepairChange[] => {
    const from = changes.length;
    for (let tok = peek(); tok && tok.t === "punct" && tok.raw !== "{" && tok.raw !== "["; tok = peek()) {
      record({ rule: "brackets", title: "Removed Unexpected Character", line: tok.line, before: tok.raw });
      p++;
    }
    return changes.slice(from);
  };

  // Each top-level value with the changes made while reading it, and the stray characters before it.
  const segments: { node: Node; strays: RepairChange[]; own: RepairChange[] }[] = [];
  let trailing: RepairChange[] = [];
  for (;;) {
    const strays = skipStray();
    if (!peek()) {
      trailing = strays;
      break;
    }
    const from = changes.length;
    const node = value();
    segments.push({ node, strays, own: changes.slice(from) });
  }
  if (segments.length === 0) return value();

  // Text or code around an object or array, as in an AI answer, "const data = {…};" or "export default {…}":
  // keep the JSON and drop the rest, with everything that was "fixed" inside the dropped text.
  const isContainer = (n: Node) => n.k === "obj" || n.k === "arr";
  let kept = segments;
  if (segments.some((g) => isContainer(g.node)) && segments.some((g) => !isContainer(g.node))) {
    kept = segments.filter((g) => isContainer(g.node));
    const dropped = new Set([...segments.filter((g) => !isContainer(g.node)).flatMap((g) => g.own), ...segments.flatMap((g) => g.strays), ...trailing]);
    const remaining = changes.filter((c) => !dropped.has(c));
    changes.length = 0;
    changes.push(...remaining);
    const firstLine = tokens.find((t) => t.t !== "comment")?.line ?? 1;
    record({ rule: "extras", title: "Removed Text Around the JSON", line: firstLine, note: "Kept the JSON and removed the text or code before and after it." });
  }
  const roots = kept.map((g) => g.node);
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

export function repair(input: string, options: Partial<RepairOptions> = allRules): RepairResult {
  if (input.trim() === "") return { status: "empty" };
  // Options saved before a rule existed don't mention it; new rules start on.
  const rules: RepairOptions = { ...allRules, ...options };
  const changes: RepairChange[] = [];
  let text = input;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
    changes.push({ rule: "literals", title: "Removed Byte Order Mark", line: 1, note: "Removed the invisible U+FEFF character at the start." });
  }
  // JSON pasted from a chat answer or a README often sits in a markdown code block.
  let lineOffset = 0;
  const fence = /```[^\n`]*\n([\s\S]*?)\n?```/.exec(text);
  if (fence) {
    lineOffset = text.slice(0, fence.index).split("\n").length;
    // Like every other rule, a fix that's switched off stops the repair and says which rule it needs.
    if (!rules.extras) return { status: "blocked", rule: "extras", line: lineOffset, title: "Removed Markdown Code Fence" };
    changes.push({ rule: "extras", title: "Removed Markdown Code Fence", line: lineOffset, note: "Kept the JSON inside the ``` code block." });
    text = fence[1];
  }
  try {
    const parsedFrom = changes.length;
    const tree = parse(tokenize(text), rules, changes);
    // Lines are counted from the start of the code block; report them as lines of the original input.
    for (const c of changes.slice(parsedFrom)) c.line += lineOffset;
    const { output, segments } = serialize(tree);
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
