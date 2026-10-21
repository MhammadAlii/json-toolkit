import { setKey } from "@/core/json/path";
import { defaultJsonOutputOptions, formatJson, type JsonOutputOptions } from "@/features/converters/shared/json-output";

export type TsToJsonOptions = JsonOutputOptions & {
  /** `examples` picks realistic values from property names (email, createdAt, price…); `placeholders` writes "string", 0 and false. */
  values: "examples" | "placeholders";
  /** Optional properties (`name?:`) are filled in, or left out. */
  optional: "include" | "omit";
  arrayItems: 1 | 2 | 3;
};

export const defaultTsToJsonOptions: TsToJsonOptions = { ...defaultJsonOutputOptions, values: "examples", optional: "include", arrayItems: 1 };

export type TsToJsonResult =
  | { ok: true; value: unknown; json: string; root: string; types: string[]; notes: string[] }
  | { ok: false; error: string; line: number; column: number; types?: string[] };

type Node =
  | { k: "prim"; name: string }
  | { k: "lit"; value: unknown }
  | { k: "array"; of: Node }
  | { k: "tuple"; items: { type: Node; optional: boolean; rest: boolean }[] }
  | { k: "union" | "inter"; types: Node[] }
  | { k: "object"; members: Member[]; index?: Node; mapped?: { param: string; keys: Node; value: Node } }
  | { k: "ref"; name: string; args: Node[] }
  | { k: "keyof"; of: Node }
  | { k: "indexed"; of: Node; key: Node };

type Member = { name: string; optional: boolean; type: Node; example?: { value: unknown } };

type Decl = { name: string; params: { name: string; fallback?: Node }[]; type: Node; at: number };

class TsError extends Error {
  readonly at: number;
  constructor(message: string, at: number) {
    super(message);
    this.at = at;
  }
}

type Token = { kind: "ident" | "string" | "number" | "punct" | "template"; text: string; at: number; doc?: string };

const lineColumn = (text: string, at: number) => {
  let line = 1;
  let last = -1;
  for (let i = text.indexOf("\n"); i !== -1 && i < at; i = text.indexOf("\n", i + 1)) {
    line++;
    last = i;
  }
  return { line, column: at - last };
};

function tokenize(s: string): Token[] {
  const tokens: Token[] = [];
  let doc: string | undefined;
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === "/" && s[i + 1] === "/") {
      const end = s.indexOf("\n", i);
      i = end === -1 ? s.length : end;
      continue;
    }
    if (c === "/" && s[i + 1] === "*") {
      const end = s.indexOf("*/", i + 2);
      if (end === -1) throw new TsError("This comment is never closed with */.", i);
      // A JSDoc comment (/** … */) documents the declaration or property that follows it.
      if (s[i + 2] === "*") doc = s.slice(i + 3, end);
      i = end + 2;
      continue;
    }
    const at = i;
    if (c === '"' || c === "'") {
      let j = i + 1;
      let out = "";
      while (j < s.length && s[j] !== c) {
        if (s[j] === "\n") throw new TsError("This string is never closed.", i);
        if (s[j] === "\\") {
          const e = s[j + 1];
          out += e === "n" ? "\n" : e === "t" ? "\t" : (e ?? "");
          j += 2;
        } else out += s[j++];
      }
      if (j >= s.length) throw new TsError("This string is never closed.", i);
      tokens.push({ kind: "string", text: out, at, doc });
      i = j + 1;
    } else if (c === "`") {
      const end = s.indexOf("`", i + 1);
      if (end === -1) throw new TsError("This template literal is never closed.", i);
      tokens.push({ kind: "template", text: s.slice(i + 1, end), at, doc });
      i = end + 1;
    } else if (/[0-9]/.test(c)) {
      const m = /^(?:0x[0-9a-fA-F_]+|[0-9][0-9_]*(?:\.[0-9_]*)?(?:[eE][-+]?\d+)?)n?/.exec(s.slice(i, i + 100))!;
      tokens.push({ kind: "number", text: m[0], at, doc });
      i += m[0].length;
    } else if (/[A-Za-z_$À-￿]/.test(c)) {
      const m = /^[A-Za-z_$À-￿][\w$À-￿]*/.exec(s.slice(i, i + 200))!;
      tokens.push({ kind: "ident", text: m[0], at, doc });
      i += m[0].length;
    } else {
      const three = s.slice(i, i + 3);
      const two = s.slice(i, i + 2);
      const text = three === "..." ? three : two === "=>" || two === "?." ? two : c;
      tokens.push({ kind: "punct", text, at, doc });
      i += text.length;
    }
    doc = undefined;
  }
  return tokens;
}

// The example a JSDoc comment gives: @example or @default, or the "e.g. …" JSON to TypeScript writes.
function docExample(doc: string | undefined): { value: unknown } | undefined {
  if (!doc) return undefined;
  const text = doc.replace(/^\s*\*\s?/gm, "").trim();
  const m = /@(?:example|default)\s+([^\n]+)/.exec(text) ?? /\be\.g\.\s+(.+?)(?:\s+\([^)]*\))?\s*$/m.exec(text);
  if (!m) return undefined;
  const raw = m[1].trim();
  try {
    return { value: JSON.parse(raw) as unknown };
  } catch {
    const quoted = /^'(.*)'$/.exec(raw);
    return quoted ? { value: quoted[1] } : { value: raw };
  }
}

function parse(source: string): Decl[] {
  const tokens = tokenize(source);
  const decls: Decl[] = [];
  let p = 0;
  const peek = (k = 0) => tokens[p + k];
  const is = (text: string, k = 0) => peek(k)?.text === text && peek(k)?.kind !== "string";
  const fail = (message: string, t: Token | undefined = peek()): never => {
    throw new TsError(message, t ? t.at : source.length);
  };
  const expect = (text: string) => {
    if (!is(text)) fail(`Expected “${text}” here${peek() ? `, but found “${peek().text}”` : ""}.`);
    p++;
  };
  const ident = () => (peek()?.kind === "ident" ? tokens[p++].text : fail("Expected a name here."));

  // Skips a balanced group starting at an opening bracket.
  const skipGroup = () => {
    const open = peek().text;
    const close = open === "(" ? ")" : open === "[" ? "]" : open === "{" ? "}" : ">";
    let depth = 0;
    do {
      if (!peek()) fail(`This ${open} is never closed with ${close}.`);
      if (is(open)) depth++;
      else if (is(close)) depth--;
      p++;
    } while (depth > 0);
  };

  const typeParams = () => {
    const params: Decl["params"] = [];
    if (!is("<")) return params;
    p++;
    while (!is(">")) {
      const name = ident();
      let fallback: Node | undefined;
      if (is("extends")) {
        p++;
        fallback = type();
      }
      if (is("=")) {
        p++;
        fallback = type();
      }
      params.push({ name, fallback });
      if (is(",")) p++;
      else if (!is(">")) fail("Expected “,” or “>” in the type parameters.");
    }
    p++;
    return params;
  };

  const members = (close: string): { members: Member[]; index?: Node; mapped?: { param: string; keys: Node; value: Node } } => {
    const list: Member[] = [];
    let index: Node | undefined;
    let mapped: { param: string; keys: Node; value: Node } | undefined;
    while (!is(close)) {
      if (!peek()) fail(`Expected “${close}” to close the type.`);
      const doc = peek().doc;
      while (peek()?.kind === "ident" && /^(readonly|public|private|protected|static|declare|abstract)$/.test(peek().text) && !is(":", 1) && !is("?", 1) && !is("(", 1)) p++;
      if (is("-") || is("+")) p++;
      if (is("[")) {
        // [key: string]: T, or a mapped type [K in Keys]: T.
        const save = p;
        p++;
        if (peek()?.kind === "ident" && (is(":", 1) || is("in", 1))) {
          p += 2;
          const keys = type();
          if (is("as")) {
            p++;
            type();
          }
          expect("]");
          if (is("-") || is("+")) p++;
          if (is("?")) p++;
          expect(":");
          const value = type();
          // A mapped type's keys may name an alias or a type parameter, so they're resolved when generating.
          if (tokens[save + 2].text === "in") mapped = { param: tokens[save + 1].text, keys, value };
          else index = value;
        } else {
          // A computed key such as [Symbol.iterator]: skipped.
          p = save;
          skipGroup();
          if (is("?")) p++;
          if (is(":")) {
            p++;
            type();
          } else if (is("(")) {
            skipGroup();
            if (is(":")) {
              p++;
              type();
            }
          }
        }
      } else if (is("(") || is("<") || is("new")) {
        // Call and construct signatures describe functions, which JSON can't hold.
        if (is("new")) p++;
        if (is("<")) skipGroup();
        skipGroup();
        if (is(":")) {
          p++;
          type();
        }
      } else {
        const t = peek();
        const name = t.kind === "ident" || t.kind === "string" || t.kind === "number" ? t.text : fail("Expected a property name here.");
        p++;
        if ((name === "get" || name === "set") && peek()?.kind === "ident" && is("(", 1)) {
          p++;
          skipGroup();
          if (is(":")) {
            p++;
            type();
          }
        } else {
          const optional = is("?");
          if (optional) p++;
          if (is("(") || is("<")) {
            if (is("<")) skipGroup();
            skipGroup();
            if (is(":")) {
              p++;
              type();
            }
          } else if (is(":")) {
            p++;
            list.push({ name, optional, type: type(), example: docExample(doc) });
          } else list.push({ name, optional, type: { k: "prim", name: "any" }, example: docExample(doc) });
          // A class property can have an initialiser; it's skipped.
          if (is("=")) {
            p++;
            while (peek() && !is(";") && !is(close) && !is(",")) p++;
          }
        }
      }
      if (is(";") || is(",")) p++;
    }
    p++;
    return { members: list, index, mapped };
  };

  const primary = (): Node => {
    const t = peek();
    if (!t) fail("Expected a type here.");
    if (t.kind === "string" || t.kind === "template") {
      p++;
      return t.kind === "string" ? { k: "lit", value: t.text } : { k: "prim", name: "string" };
    }
    if (t.kind === "number") {
      p++;
      return { k: "lit", value: Number(t.text.replace(/_|n$/g, "")) };
    }
    if (is("-") && peek(1)?.kind === "number") {
      p += 2;
      return { k: "lit", value: -Number(tokens[p - 1].text.replace(/_|n$/g, "")) };
    }
    if (is("(")) {
      // A parenthesised type, or a function type (args) => R.
      const save = p;
      skipGroup();
      if (is("=>")) {
        p++;
        type();
        return { k: "prim", name: "function" };
      }
      p = save + 1;
      const inner = type();
      expect(")");
      return inner;
    }
    if (is("<")) {
      skipGroup();
      skipGroup();
      expect("=>");
      type();
      return { k: "prim", name: "function" };
    }
    if (is("new") || is("abstract")) {
      while (!is("=>")) p++;
      p++;
      type();
      return { k: "prim", name: "function" };
    }
    if (is("{")) {
      p++;
      const body = members("}");
      return { k: "object", ...body };
    }
    if (is("[")) {
      p++;
      const items: { type: Node; optional: boolean; rest: boolean }[] = [];
      while (!is("]")) {
        const rest = is("...");
        if (rest) p++;
        // Named tuple members: [name: T] or [name?: T].
        if (peek()?.kind === "ident" && (is(":", 1) || (is("?", 1) && is(":", 2)))) p += is("?", 1) ? 3 : 2;
        const item = type();
        const optional = is("?");
        if (optional) p++;
        items.push({ type: item, optional, rest });
        if (is(",")) p++;
        else if (!is("]")) fail("Expected “,” or “]” in the tuple.");
      }
      p++;
      return { k: "tuple", items };
    }
    if (t.kind === "ident") {
      p++;
      if (t.text === "typeof") {
        ident();
        while (is(".")) {
          p++;
          ident();
        }
        return { k: "prim", name: "any" };
      }
      if (t.text === "keyof") return { k: "keyof", of: postfix() };
      if (t.text === "unique" && is("symbol")) {
        p++;
        return { k: "prim", name: "symbol" };
      }
      if (t.text === "readonly" || t.text === "infer") return postfix();
      if (/^(string|number|boolean|null|undefined|void|never|any|unknown|object|bigint|symbol)$/.test(t.text)) return { k: "prim", name: t.text };
      if (t.text === "true" || t.text === "false") return { k: "lit", value: t.text === "true" };
      let name = t.text;
      while (is(".")) {
        p++;
        name = ident();
      }
      const args: Node[] = [];
      if (is("<")) {
        p++;
        while (!is(">")) {
          args.push(type());
          if (is(",")) p++;
          else if (!is(">")) fail("Expected “,” or “>” in the type arguments.");
        }
        p++;
      }
      return { k: "ref", name, args };
    }
    return fail(`Unexpected “${t.text}” in a type.`);
  };

  const postfix = (): Node => {
    let n = primary();
    while (is("[")) {
      if (is("]", 1)) {
        p += 2;
        n = { k: "array", of: n };
      } else {
        // An indexed access type such as T["key"] or T[K].
        p++;
        const key = type();
        expect("]");
        n = { k: "indexed", of: n, key };
      }
    }
    return n;
  };

  const intersection = (): Node => {
    if (is("&")) p++;
    const types = [postfix()];
    while (is("&")) {
      p++;
      types.push(postfix());
    }
    return types.length === 1 ? types[0] : { k: "inter", types };
  };

  const union = (): Node => {
    if (is("|")) p++;
    const types = [intersection()];
    while (is("|")) {
      p++;
      types.push(intersection());
    }
    return types.length === 1 ? types[0] : { k: "union", types };
  };

  // Conditional types (A extends B ? X : Y) are read as their first branch.
  function type(): Node {
    const n = union();
    if (is("extends") && !is("{", 1)) {
      p++;
      union();
      expect("?");
      const yes = type();
      expect(":");
      type();
      return yes;
    }
    return n;
  }

  const skipStatement = () => {
    while (peek() && !is(";")) {
      if (is("{") || is("(") || is("[")) skipGroup();
      else p++;
      // A declaration keyword on the next line starts the next statement.
      if (peek() && /^(export|interface|type|enum|declare|const|let|var|function|class|import|namespace|module)$/.test(peek().text) && source.lastIndexOf("\n", peek().at) > tokens[p - 1].at) return;
    }
    if (is(";")) p++;
  };

  while (p < tokens.length) {
    while (is("export") || is("declare") || is("default")) p++;
    const t = peek();
    if (!t) break;
    if (is("interface")) {
      p++;
      const name = ident();
      const params = typeParams();
      const parts: Node[] = [];
      if (is("extends")) {
        p++;
        do {
          if (is(",")) p++;
          parts.push(postfix());
        } while (is(","));
      }
      expect("{");
      parts.push({ k: "object", ...members("}") });
      decls.push({ name, params, type: parts.length === 1 ? parts[0] : { k: "inter", types: parts }, at: t.at });
    } else if (is("type") && peek(1)?.kind === "ident") {
      p++;
      const name = ident();
      const params = typeParams();
      expect("=");
      decls.push({ name, params, type: type(), at: t.at });
      if (is(";")) p++;
    } else if (is("enum") || (is("const") && is("enum", 1))) {
      if (is("const")) p++;
      p++;
      const name = ident();
      expect("{");
      const values: Node[] = [];
      let next = 0;
      while (!is("}")) {
        if (!peek()) fail("This enum is never closed with “}”.");
        p++;
        if (is("=")) {
          p++;
          const v = peek();
          if (v.kind === "string") values.push({ k: "lit", value: v.text });
          else if (v.kind === "number" || (is("-") && peek(1)?.kind === "number")) {
            const n = v.kind === "number" ? Number(v.text) : -Number(peek(1).text);
            values.push({ k: "lit", value: n });
            next = n + 1;
          }
          while (peek() && !is(",") && !is("}")) p++;
        } else values.push({ k: "lit", value: next++ });
        if (is(",")) p++;
      }
      p++;
      decls.push({ name, params: [], type: values.length ? { k: "union", types: values } : { k: "prim", name: "number" }, at: t.at });
    } else if (is("class") || (is("abstract") && is("class", 1))) {
      if (is("abstract")) p++;
      p++;
      const name = ident();
      const params = typeParams();
      while (peek() && !is("{")) p++;
      p++;
      decls.push({ name, params, type: { k: "object", ...members("}") }, at: t.at });
    } else if (is("namespace") || is("module")) {
      // Declarations inside a namespace are read as if at the top level.
      while (peek() && !is("{")) p++;
      p++;
    } else if (is("}")) p++;
    else skipStatement();
  }
  return decls;
}

const words = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_\-.]+/g, " ").toLowerCase().trim();

// Plausible values for a property, guessed from its name.
function exampleString(key: string): string {
  const k = words(key);
  const last = k.split(" ").pop() ?? "";
  if (/\bemail\b|\bmail\b/.test(k)) return "ada@example.com";
  if (/\b(url|uri|link|href|website|homepage|avatar|image|photo|picture|logo|icon|thumbnail)\b/.test(k)) return /avatar|image|photo|picture|logo|icon|thumbnail/.test(k) ? "https://example.com/image.png" : "https://example.com";
  if (/\b(uuid|guid)\b/.test(k) || last === "id") return "3f2a8c1e-5b7d-4e9a-a2c4-6d8e0f1b3a5c";
  if (/\b(birthday|dob|birth date)\b|date$/.test(k)) return "2024-01-15";
  if (/\b(at|time|timestamp|created|updated|deleted|modified|expires|start|end)\b/.test(last) || /time|timestamp/.test(k)) return "2024-01-15T09:30:00Z";
  if (/\bfirst name\b|^first$|given name/.test(k)) return "Ada";
  if (/\blast name\b|^last$|surname|family name/.test(k)) return "Lovelace";
  if (/\b(user ?name|login|handle|nick)/.test(k)) return "ada";
  if (/\b(full name|display name|author)\b/.test(k) || k === "name") return "Ada Lovelace";
  if (/\bname\b/.test(k)) return "Example";
  if (/\btitle\b|headline|subject|label/.test(k)) return "Example title";
  if (/description|summary|bio|body|content|text|message|comment|note|details/.test(k)) return "Lorem ipsum dolor sit amet.";
  if (/phone|mobile|tel\b|fax/.test(k)) return "+1 555 0100";
  if (/\bcity\b|town/.test(k)) return "London";
  if (/country code/.test(k)) return "GB";
  if (/\bcountry\b/.test(k)) return "United Kingdom";
  if (/\b(zip|postal|post code|postcode)\b/.test(k)) return "SW1A 1AA";
  if (/\b(street|address|line ?1)\b/.test(k)) return "10 Downing Street";
  if (/\b(state|province|region|county)\b/.test(k)) return "Greater London";
  if (/\bcurrency\b/.test(k)) return "USD";
  if (/\b(lang|language|locale)\b/.test(k)) return "en-US";
  if (/\b(colou?r|hex)\b/.test(k)) return "#3b82f6";
  if (/\bstatus\b|\bstate\b/.test(k)) return "active";
  if (/\b(role)\b/.test(k)) return "admin";
  if (/\b(type|kind|category|group)\b/.test(k)) return "default";
  if (/\bslug\b/.test(k)) return "example-slug";
  if (/\b(password|secret|token|api key|key|hash|signature)\b/.test(k)) return "a1b2c3d4e5f6";
  if (/\b(ip|ip address)\b/.test(k)) return "192.0.2.1";
  if (/\bversion\b/.test(k)) return "1.0.0";
  if (/\btags?\b/.test(k)) return "example";
  if (/\b(path|file|filename)\b/.test(k)) return "/path/to/file.txt";
  if (/\b(sku|code)\b/.test(k)) return "ABC-123";
  return "example";
}

function exampleNumber(key: string, index: number): number {
  const k = words(key);
  const last = k.split(" ").pop() ?? "";
  if (last === "id" || /\bid\b/.test(k)) return index + 1;
  if (/\bage\b/.test(k)) return 36;
  if (/price|amount|cost|total|balance|salary|fee|subtotal|tax/.test(k)) return 19.99;
  if (/count|qty|quantity|items|number of|size/.test(k)) return 3;
  if (/\byear\b/.test(k)) return 2024;
  if (/\b(lat|latitude)\b/.test(k)) return 51.5074;
  if (/\b(lng|lon|long|longitude)\b/.test(k)) return -0.1278;
  if (/\b(at|time|timestamp|created|updated|date)\b/.test(k)) return 1705311000;
  if (/percent|ratio|rate/.test(k)) return 0.25;
  if (/rating|score|stars/.test(k)) return 4.5;
  if (/\bport\b/.test(k)) return 8080;
  if (/\b(width|height)\b/.test(k)) return 640;
  if (/\b(index|position|order|rank|page)\b/.test(k)) return index + 1;
  return 42;
}

const singular = (key: string) => (/ies$/i.test(key) ? key.slice(0, -3) + "y" : /ses$/i.test(key) ? key.slice(0, -2) : /s$/i.test(key) && key.length > 3 ? key.slice(0, -1) : key);

// A value that can't be shown in JSON (a function, undefined, a recursive type at its limit).
const skip = Symbol("skip");

// Arrays of several items inside deeply nested types multiply quickly; this keeps the sample a sample.
const maxValues = 200_000;

/** Generates sample JSON from TypeScript interfaces, type aliases and enums. `root` names the type to generate; by default the first one no other type uses. */
export function typeScriptToJson(input: string, options: TsToJsonOptions = defaultTsToJsonOptions, root?: string): TsToJsonResult {
  const o = options;
  const source = input.replace(/\r\n?/g, "\n");
  let decls: Decl[];
  try {
    decls = parse(source);
  } catch (e) {
    if (!(e instanceof TsError)) throw e;
    return { ok: false, error: e.message, ...lineColumn(source, Math.min(e.at, source.length)) };
  }
  const types = decls.map((d) => d.name);
  if (!decls.length) return { ok: false, error: "There are no interface, type or enum declarations to generate JSON from.", line: 1, column: 1 };
  const byName = new Map(decls.map((d) => [d.name, d]));
  const notes = new Set<string>();

  // The root: the chosen type, else the first type that no other declaration refers to.
  const referenced = new Set<string>();
  const collect = (n: Node) => {
    if (n.k === "ref") {
      referenced.add(n.name);
      n.args.forEach(collect);
    } else if (n.k === "array" || n.k === "keyof") collect(n.of);
    else if (n.k === "indexed") [n.of, n.key].forEach(collect);
    else if (n.k === "tuple") n.items.forEach((i) => collect(i.type));
    else if (n.k === "union" || n.k === "inter") n.types.forEach(collect);
    else if (n.k === "object") {
      n.members.forEach((m) => collect(m.type));
      if (n.index) collect(n.index);
      if (n.mapped) [n.mapped.keys, n.mapped.value].forEach(collect);
    }
  };
  decls.forEach((d) => collect(d.type));
  const rootDecl = (root && byName.get(root)) || decls.find((d) => !referenced.has(d.name)) || decls[0];

  const stack: string[] = [];
  const placeholder = o.values === "placeholders";
  let values = 0;

  const objectKeys = (n: Node, env: Map<string, Node>): string[] => {
    const v = gen(n, env, "", 0);
    return v && typeof v === "object" && !Array.isArray(v) ? Object.keys(v) : [];
  };

  const keysOf = (n: Node, env: Map<string, Node>): string[] | undefined => {
    if (n.k === "lit" && (typeof n.value === "string" || typeof n.value === "number")) return [String(n.value)];
    if (n.k === "union") {
      const parts = n.types.map((t) => keysOf(t, env));
      return parts.every(Boolean) ? (parts.flat() as string[]) : undefined;
    }
    if (n.k === "keyof") return objectKeys(n.of, env);
    if (n.k === "ref") {
      const bound = env.get(n.name);
      if (bound) return keysOf(bound, env);
      const decl = byName.get(n.name);
      if (decl && !decl.params.length) return keysOf(decl.type, env);
    }
    return undefined;
  };

  function gen(n: Node, env: Map<string, Node>, key: string, index: number): unknown {
    if (++values > maxValues) throw new TsError(`The sample would hold more than ${maxValues.toLocaleString("en-US")} values; lower Array items under Options.`, rootDecl.at);
    switch (n.k) {
      case "lit":
        return n.value;
      case "prim":
        switch (n.name) {
          case "string":
            return placeholder ? "string" : exampleString(key);
          case "number":
          case "bigint":
            return placeholder ? 0 : exampleNumber(key, index);
          case "boolean":
            return !placeholder;
          case "null":
            return null;
          case "object":
            return {};
          case "any":
          case "unknown":
            return null;
          default:
            if (n.name === "function") notes.add("Function types have no JSON form, so properties holding them were left out.");
            return skip;
        }
      case "array": {
        // A list of the type being expanded is where a recursive type stops.
        if (n.of.k === "ref" && !env.has(n.of.name) && stack.includes(n.of.name)) return [];
        const out: unknown[] = [];
        for (let i = 0; i < o.arrayItems; i++) {
          const v = gen(n.of, env, singular(key), i);
          if (v !== skip) out.push(v);
        }
        return out;
      }
      case "tuple":
        return n.items.filter((i) => !(i.optional && o.optional === "omit")).map((i, k) => gen(i.rest && i.type.k === "array" ? i.type.of : i.type, env, key, k)).filter((v) => v !== skip);
      case "union": {
        // The first member that isn't null or undefined, so the sample shows the real shape.
        const real = n.types.filter((t) => !(t.k === "prim" && /^(null|undefined|void|never)$/.test(t.name)));
        for (const t of real.length ? real : n.types) {
          const v = gen(t, env, key, index);
          if (v !== skip) return v;
        }
        return null;
      }
      case "inter": {
        const parts = n.types.map((t) => gen(t, env, key, index)).filter((v) => v !== skip);
        if (parts.every((v) => v && typeof v === "object" && !Array.isArray(v))) {
          const merged: Record<string, unknown> = {};
          for (const part of parts) for (const [k, v] of Object.entries(part as object)) setKey(merged, k, v);
          return merged;
        }
        return parts[parts.length - 1] ?? null;
      }
      case "keyof": {
        const keys = objectKeys(n.of, env);
        return keys[0] ?? (placeholder ? "string" : "key");
      }
      case "indexed": {
        const k = keysOf(n.key, env)?.[0];
        const v = gen(n.of, env, k ?? key, index);
        if (Array.isArray(v)) return v[0] ?? null;
        if (v && typeof v === "object" && k !== undefined && Object.prototype.hasOwnProperty.call(v, k)) return (v as Record<string, unknown>)[k];
        return null;
      }
      case "object": {
        const obj: Record<string, unknown> = {};
        for (const m of n.members) {
          if (m.optional && o.optional === "omit") continue;
          const v = m.example ? m.example.value : gen(m.type, env, m.name, index);
          if (v !== skip) setKey(obj, m.name, v);
        }
        if (n.mapped) {
          for (const k of keysOf(n.mapped.keys, env) ?? [placeholder ? "key" : "key1"]) {
            const scope = new Map(env).set(n.mapped.param, { k: "lit", value: k });
            const v = gen(n.mapped.value, scope, k, index);
            if (v !== skip) setKey(obj, k, v);
          }
        }
        if (n.index && !n.members.length) {
          const v = gen(n.index, env, key, index);
          if (v !== skip) setKey(obj, placeholder ? "key" : "key1", v);
        }
        return obj;
      }
      case "ref":
        return ref(n, env, key, index);
    }
  }

  function ref(n: Extract<Node, { k: "ref" }>, env: Map<string, Node>, key: string, index: number): unknown {
    const bound = env.get(n.name);
    if (bound) return gen(bound, env, key, index);
    const [a, b] = n.args;
    switch (n.name) {
      case "Array":
      case "ReadonlyArray":
      case "Set":
      case "ReadonlySet":
        return gen({ k: "array", of: a ?? { k: "prim", name: "unknown" } }, env, key, index);
      case "Partial":
      case "Required":
      case "Readonly":
      case "NonNullable":
      case "Promise":
      case "Awaited":
      case "Lowercase":
      case "Uppercase":
      case "Capitalize":
      case "Uncapitalize":
        return a ? gen(a, env, key, index) : null;
      case "Record": {
        const keys = a ? keysOf(a, env) : undefined;
        const obj: Record<string, unknown> = {};
        for (const k of keys ?? [placeholder ? "key" : "key1"]) {
          const v = b ? gen(b, env, k, index) : null;
          if (v !== skip) setKey(obj, k, v);
        }
        return obj;
      }
      case "Map":
      case "ReadonlyMap":
      case "WeakMap":
        return {};
      case "Pick":
      case "Omit": {
        const value = a ? gen(a, env, key, index) : {};
        const keys = new Set(b ? (keysOf(b, env) ?? []) : []);
        if (!value || typeof value !== "object" || Array.isArray(value)) return value;
        const obj: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) if (keys.has(k) === (n.name === "Pick")) setKey(obj, k, v);
        return obj;
      }
      case "Exclude":
      case "Extract": {
        if (!a) return null;
        const drop = new Set((b && keysOf(b, env)) ?? []);
        if (a.k === "union") {
          const kept = a.types.filter((t) => (t.k === "lit" ? drop.has(String(t.value)) === (n.name === "Extract") : n.name === "Exclude"));
          return kept.length ? gen(kept[0], env, key, index) : null;
        }
        return gen(a, env, key, index);
      }
      case "Date":
        return placeholder ? "string" : "2024-01-15T09:30:00Z";
      case "RegExp":
      case "Error":
        return placeholder ? "string" : "example";
      case "String":
        return gen({ k: "prim", name: "string" }, env, key, index);
      case "Number":
      case "BigInt":
        return gen({ k: "prim", name: "number" }, env, key, index);
      case "Boolean":
        return gen({ k: "prim", name: "boolean" }, env, key, index);
      case "Object":
        return {};
      case "Function":
        return gen({ k: "prim", name: "function" }, env, key, index);
    }
    const decl = byName.get(n.name);
    if (!decl) {
      notes.add(`Types that aren't declared in the input, such as ${n.name}, were filled with null.`);
      return null;
    }
    // A recursive type stops the second time it's reached: as an empty list, or null.
    if (stack.includes(decl.name)) {
      notes.add("Recursive types were expanded once; deeper levels are empty lists or null.");
      return null;
    }
    const scope = new Map(env);
    decl.params.forEach((param, i) => scope.set(param.name, n.args[i] ?? param.fallback ?? { k: "prim", name: "unknown" }));
    stack.push(decl.name);
    const v = gen(decl.type, scope, key, index);
    stack.pop();
    return v;
  }

  let result: unknown;
  let json: string;
  try {
    const value = gen({ k: "ref", name: rootDecl.name, args: [] }, new Map(), rootDecl.name, 0);
    result = value === skip ? null : value;
    json = formatJson(result, o);
  } catch (e) {
    if (e instanceof TsError) return { ok: false, error: e.message, ...lineColumn(source, e.at), types };
    if (e instanceof RangeError) return { ok: false, error: "The types are nested too deeply to generate JSON from.", line: 1, column: 1, types };
    throw e;
  }
  return { ok: true, value: result, json, root: rootDecl.name, types, notes: [...notes] };
}
