import { isPlainObject, type PathSegment } from "@/core/json/path";

// A safe JSONPath (RFC 9535 subset) evaluator: no eval, no prototype access.
// Supports $, @, .name, ['name'], [n], [-n], [a:b:c], [*], .*, .., unions, and filters
// [?expr] / [?(expr)] with == != < <= > >= && || ! ( ), literals and the RFC 9535 functions length() / count() / match() / search() / value().
// The same expression language powers WHERE clauses, where bare names refer to the current item.

type Token = { kind: "num" | "str" | "id" | "op"; value: string; num?: number; pos: number };

const ops = ["..", "==", "!=", "<=", ">=", "&&", "||", "$", "@", ".", "[", "]", "(", ")", "*", "?", ":", ",", "<", ">", "!", "-", "="];

class QueryError extends Error {}

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      let s = "";
      while (j < src.length && src[j] !== c) {
        if (src[j] === "\\" && j + 1 < src.length) {
          const e = src[++j];
          s += e === "n" ? "\n" : e === "t" ? "\t" : e;
        } else s += src[j];
        j++;
      }
      if (j >= src.length) throw new QueryError(`Unclosed string starting at ${i + 1}`);
      tokens.push({ kind: "str", value: s, pos: i });
      i = j + 1;
      continue;
    }
    const num = /^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(src.slice(i));
    if (num) {
      tokens.push({ kind: "num", value: num[0], num: Number(num[0]), pos: i });
      i += num[0].length;
      continue;
    }
    const id = /^[A-Za-z_\u0080-￿][\w\u0080-￿-]*/.exec(src.slice(i));
    if (id) {
      tokens.push({ kind: "id", value: id[0], pos: i });
      i += id[0].length;
      continue;
    }
    const op = ops.find((o) => src.startsWith(o, i));
    if (!op) throw new QueryError(`Unexpected "${c}" at ${i + 1}`);
    tokens.push({ kind: "op", value: op, pos: i });
    i += op.length;
  }
  return tokens;
}

type Selector =
  | { kind: "name"; name: string }
  | { kind: "wild" }
  | { kind: "index"; index: number }
  | { kind: "slice"; start?: number; end?: number; step?: number }
  | { kind: "filter"; expr: Expr };

type Segment = { descendant: boolean; selectors: Selector[] };

type Expr =
  | { kind: "or" | "and"; a: Expr; b: Expr }
  | { kind: "not"; a: Expr }
  | { kind: "cmp"; op: string; a: Expr; b: Expr }
  | { kind: "lit"; value: unknown }
  | { kind: "query"; root: "@" | "$"; segments: Segment[] }
  | { kind: "fn"; name: string; args: Expr[] };

type Mode = "path" | "where";

class Parser {
  private i = 0;
  private tokens: Token[];
  private mode: Mode;

  constructor(tokens: Token[], mode: Mode) {
    this.tokens = tokens;
    this.mode = mode;
  }

  private peek(offset = 0) {
    return this.tokens[this.i + offset];
  }
  private isOp(value: string, offset = 0) {
    const t = this.peek(offset);
    return t?.kind === "op" && t.value === value;
  }
  private take(value?: string): Token {
    const t = this.tokens[this.i];
    if (!t) throw new QueryError(value ? `Expected "${value}" at the end` : "Unexpected end of expression");
    if (value && !(t.kind === "op" && t.value === value)) throw new QueryError(`Expected "${value}" at ${t.pos + 1}, found "${t.value}"`);
    this.i++;
    return t;
  }
  done() {
    const t = this.peek();
    if (t) throw new QueryError(`Unexpected "${t.value}" at ${t.pos + 1}`);
  }

  query(): Segment[] {
    this.take("$");
    return this.segments();
  }

  segments(): Segment[] {
    const out: Segment[] = [];
    for (;;) {
      if (this.isOp("..")) {
        this.take();
        if (this.isOp("[")) out.push({ descendant: true, selectors: this.bracket() });
        else out.push({ descendant: true, selectors: [this.dotSelector()] });
      } else if (this.isOp(".")) {
        this.take();
        out.push({ descendant: false, selectors: [this.dotSelector()] });
      } else if (this.isOp("[")) {
        out.push({ descendant: false, selectors: this.bracket() });
      } else return out;
    }
  }

  private dotSelector(): Selector {
    if (this.isOp("*")) {
      this.take();
      return { kind: "wild" };
    }
    const t = this.take();
    if (t.kind !== "id" && t.kind !== "num") throw new QueryError(`Expected a name after "." at ${t.pos + 1}`);
    return { kind: "name", name: t.value };
  }

  private int(): number {
    const neg = this.isOp("-") ? (this.take(), -1) : 1;
    const t = this.take();
    if (t.kind !== "num" || !Number.isInteger(t.num)) throw new QueryError(`Expected an integer at ${t.pos + 1}`);
    return neg * (t.num as number);
  }

  private bracket(): Selector[] {
    this.take("[");
    const selectors: Selector[] = [];
    do {
      if (selectors.length) this.take(",");
      selectors.push(this.selector());
    } while (this.isOp(","));
    this.take("]");
    return selectors;
  }

  private selector(): Selector {
    const t = this.peek();
    if (!t) throw new QueryError("Unclosed [");
    if (t.kind === "str") {
      this.take();
      return { kind: "name", name: t.value };
    }
    if (this.isOp("*")) {
      this.take();
      return { kind: "wild" };
    }
    if (this.isOp("?")) {
      this.take();
      return { kind: "filter", expr: this.or() };
    }
    const startTok = this.isOp(":") ? undefined : this.int();
    if (!this.isOp(":")) return { kind: "index", index: startTok as number };
    this.take(":");
    const end = this.isOp(":") || this.isOp("]") || this.isOp(",") ? undefined : this.int();
    let step: number | undefined;
    if (this.isOp(":")) {
      this.take();
      step = this.isOp("]") || this.isOp(",") ? undefined : this.int();
    }
    return { kind: "slice", start: startTok, end, step };
  }

  private keyword(word: string) {
    const t = this.peek();
    return this.mode === "where" && t?.kind === "id" && t.value.toLowerCase() === word;
  }

  or(): Expr {
    let a = this.and();
    while (this.isOp("||") || this.keyword("or")) {
      this.take();
      a = { kind: "or", a, b: this.and() };
    }
    return a;
  }

  private and(): Expr {
    let a = this.not();
    while (this.isOp("&&") || this.keyword("and")) {
      this.take();
      a = { kind: "and", a, b: this.not() };
    }
    return a;
  }

  private not(): Expr {
    if (this.isOp("!") || this.keyword("not")) {
      this.take();
      return { kind: "not", a: this.not() };
    }
    return this.comparison();
  }

  private comparison(): Expr {
    const a = this.operand();
    const t = this.peek();
    if (t?.kind === "op" && ["==", "!=", "<", "<=", ">", ">=", "="].includes(t.value)) {
      if (t.value === "=" && this.mode !== "where") throw new QueryError(`Use "==" to compare (at ${t.pos + 1})`);
      this.take();
      return { kind: "cmp", op: t.value === "=" ? "==" : t.value, a, b: this.operand() };
    }
    return a;
  }

  private operand(): Expr {
    const t = this.peek();
    if (!t) throw new QueryError("Unexpected end of expression");
    if (this.isOp("(")) {
      this.take();
      const e = this.or();
      this.take(")");
      return e;
    }
    if (this.isOp("@") || this.isOp("$")) {
      const root = this.take().value as "@" | "$";
      return { kind: "query", root, segments: this.segments() };
    }
    if (this.isOp("-")) {
      this.take();
      const n = this.take();
      if (n.kind !== "num") throw new QueryError(`Expected a number at ${n.pos + 1}`);
      return { kind: "lit", value: -(n.num as number) };
    }
    if (t.kind === "num") {
      this.take();
      return { kind: "lit", value: t.num };
    }
    if (t.kind === "str") {
      this.take();
      return { kind: "lit", value: t.value };
    }
    if (t.kind === "id") {
      if (t.value === "true" || t.value === "false" || t.value === "null") {
        this.take();
        return { kind: "lit", value: t.value === "null" ? null : t.value === "true" };
      }
      if (this.isOp("(", 1)) {
        this.take();
        this.take("(");
        const args: Expr[] = [];
        while (!this.isOp(")")) {
          if (args.length) this.take(",");
          args.push(this.or());
        }
        this.take(")");
        if (!functions[t.value] && !nodeFunctions[t.value]) throw new QueryError(`Unknown function ${t.value}() at ${t.pos + 1}`);
        return { kind: "fn", name: t.value, args };
      }
      if (this.mode === "where") {
        this.take();
        return { kind: "query", root: "@", segments: [{ descendant: false, selectors: [{ kind: "name", name: t.value }] }, ...this.segments()] };
      }
    }
    throw new QueryError(`Unexpected "${t.value}" at ${t.pos + 1}`);
  }
}

export type JsonNode = { value: unknown; path: PathSegment[] };

const own = (o: Record<string, unknown>, k: string) => Object.prototype.hasOwnProperty.call(o, k);

function children(node: JsonNode): JsonNode[] {
  const v = node.value;
  if (Array.isArray(v)) return v.map((value, i) => ({ value, path: [...node.path, i] }));
  if (isPlainObject(v)) return Object.keys(v).map((k) => ({ value: v[k], path: [...node.path, k] }));
  return [];
}

function descendants(node: JsonNode, out: JsonNode[] = []): JsonNode[] {
  out.push(node);
  for (const c of children(node)) descendants(c, out);
  return out;
}

function select(node: JsonNode, s: Selector, root: unknown): JsonNode[] {
  const v = node.value;
  switch (s.kind) {
    case "name":
      return isPlainObject(v) && own(v, s.name) ? [{ value: v[s.name], path: [...node.path, s.name] }] : [];
    case "wild":
      return children(node);
    case "index": {
      if (!Array.isArray(v)) return [];
      const i = s.index < 0 ? v.length + s.index : s.index;
      return i >= 0 && i < v.length ? [{ value: v[i], path: [...node.path, i] }] : [];
    }
    case "slice": {
      if (!Array.isArray(v)) return [];
      const n = v.length;
      const step = s.step ?? 1;
      if (step === 0) return [];
      const norm = (x: number) => (x < 0 ? Math.max(n + x, step > 0 ? 0 : -1) : Math.min(x, step > 0 ? n : n - 1));
      const start = s.start === undefined ? (step > 0 ? 0 : n - 1) : norm(s.start);
      const end = s.end === undefined ? (step > 0 ? n : -1) : norm(s.end);
      const out: JsonNode[] = [];
      for (let i = start; step > 0 ? i < end : i > end; i += step) out.push({ value: v[i], path: [...node.path, i] });
      return out;
    }
    case "filter":
      return children(node).filter((c) => truthy(evaluate(s.expr, c.value, root, "path"), s.expr, "path"));
  }
}

function run(segments: Segment[], start: JsonNode, root: unknown): JsonNode[] {
  let nodes = [start];
  for (const seg of segments) {
    const next: JsonNode[] = [];
    for (const n of nodes) for (const target of seg.descendant ? descendants(n) : [n]) for (const s of seg.selectors) next.push(...select(target, s, root));
    nodes = next;
  }
  return nodes;
}

const Nothing = Symbol("nothing");
type Value = unknown | typeof Nothing | JsonNode[];

const functions: Record<string, (...args: unknown[]) => unknown> = {
  length: (v) => (typeof v === "string" ? [...v].length : Array.isArray(v) ? v.length : isPlainObject(v) ? Object.keys(v).length : Nothing),
  match: (s, re) => (typeof s === "string" && typeof re === "string" ? safeRegex(`^(?:${re})$`)?.test(s) ?? false : false),
  search: (s, re) => (typeof s === "string" && typeof re === "string" ? safeRegex(re)?.test(s) ?? false : false),
};

// count() and value() take the matches of a query rather than a single value.
const nodeFunctions: Record<string, (v: Value) => unknown> = {
  count: (v) => (isNodes(v) ? v.length : Nothing),
  value: (v) => singular(v),
};

function safeRegex(src: string) {
  try {
    return new RegExp(src, "u");
  } catch {
    return null;
  }
}

function evaluate(e: Expr, current: unknown, root: unknown, mode: Mode): Value {
  switch (e.kind) {
    case "lit":
      return e.value;
    case "query":
      return run(e.segments, { value: e.root === "@" ? current : root, path: [] }, root);
    case "fn":
      if (nodeFunctions[e.name]) return nodeFunctions[e.name](evaluate(e.args[0], current, root, mode));
      return functions[e.name](...e.args.map((a) => singular(evaluate(a, current, root, mode))));
    case "not":
      return !truthy(evaluate(e.a, current, root, mode), e.a, mode);
    case "and":
      return truthy(evaluate(e.a, current, root, mode), e.a, mode) && truthy(evaluate(e.b, current, root, mode), e.b, mode);
    case "or":
      return truthy(evaluate(e.a, current, root, mode), e.a, mode) || truthy(evaluate(e.b, current, root, mode), e.b, mode);
    case "cmp":
      return compare(e.op, singular(evaluate(e.a, current, root, mode)), singular(evaluate(e.b, current, root, mode)));
  }
}

const isNodes = (v: Value): v is JsonNode[] => Array.isArray(v) && v.every((n) => n && typeof n === "object" && "path" in n && "value" in n);

function singular(v: Value): unknown {
  if (isNodes(v)) return v.length === 1 ? v[0].value : Nothing;
  return v;
}

// In JSONPath filters a bare query tests existence; in WHERE clauses it tests the value, so `active` means active is true.
function truthy(v: Value, e: Expr, mode: Mode): boolean {
  if (e.kind === "query") {
    const nodes = v as JsonNode[];
    return mode === "path" ? nodes.length > 0 : nodes.length === 1 && Boolean(nodes[0].value);
  }
  return v !== Nothing && Boolean(v);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  if (isPlainObject(a) && isPlainObject(b)) {
    const ka = Object.keys(a);
    return ka.length === Object.keys(b).length && ka.every((k) => own(b, k) && deepEqual(a[k], b[k]));
  }
  return false;
}

function compare(op: string, a: unknown, b: unknown): boolean {
  if (op === "==") return deepEqual(a, b);
  if (op === "!=") return !deepEqual(a, b);
  const comparable = (typeof a === "number" && typeof b === "number") || (typeof a === "string" && typeof b === "string");
  if (!comparable) return false;
  const [x, y] = [a as number | string, b as number | string];
  return op === "<" ? x < y : op === "<=" ? x <= y : op === ">" ? x > y : x >= y;
}

export type QueryResult = { ok: true; nodes: JsonNode[] } | { ok: false; error: string };

export function queryJsonPath(value: unknown, path: string): QueryResult {
  try {
    const p = new Parser(tokenize(path.trim()), "path");
    const segments = p.query();
    p.done();
    return { ok: true, nodes: run(segments, { value, path: [] }, value) };
  } catch (err) {
    if (err instanceof QueryError) return { ok: false, error: err.message };
    throw err;
  }
}

export type Predicate = (item: unknown, root: unknown) => boolean;

/** Compiles a WHERE-style condition such as `age > 18 and profile.active`. */
export function compileCondition(src: string): { ok: true; test: Predicate } | { ok: false; error: string } {
  try {
    const p = new Parser(tokenize(src), "where");
    const expr = p.or();
    p.done();
    return { ok: true, test: (item, root) => truthy(evaluate(expr, item, root, "where"), expr, "where") };
  } catch (err) {
    if (err instanceof QueryError) return { ok: false, error: err.message };
    throw err;
  }
}

export type FieldPath = { segments: PathSegment[]; get: (item: unknown) => unknown };

/** Parses a field reference like `profile.name`, `tags[0]` or `['first name']` relative to an item. */
export function compileField(src: string): { ok: true; field: FieldPath } | { ok: false; error: string } {
  try {
    const tokens = tokenize(src.trim());
    const p = new Parser(tokens[0]?.kind === "op" && tokens[0].value === "[" ? tokens : [{ kind: "op", value: ".", pos: 0 }, ...tokens], "path");
    const segs = p.segments();
    p.done();
    const segments: PathSegment[] = [];
    for (const s of segs) {
      const sel = s.selectors[0];
      if (s.descendant || s.selectors.length !== 1 || (sel.kind !== "name" && sel.kind !== "index")) throw new QueryError(`"${src}" must point to a single field`);
      segments.push(sel.kind === "name" ? sel.name : sel.index);
    }
    if (segments.length === 0) throw new QueryError("Expected a field name");
    return {
      ok: true,
      field: {
        segments,
        get: (item) => {
          const nodes = run(segs, { value: item, path: [] }, item);
          return nodes.length === 1 ? nodes[0].value : undefined;
        },
      },
    };
  } catch (err) {
    if (err instanceof QueryError) return { ok: false, error: err.message };
    throw err;
  }
}
