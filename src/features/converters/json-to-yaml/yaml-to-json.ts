import { isPlainObject, setKey } from "@/core/json/path";
import { defaultJsonOutputOptions, formatJson, type JsonOutputOptions } from "@/features/converters/shared/json-output";

export type YamlToJsonOptions = JsonOutputOptions & {
  /** `1.2` is the core schema; `1.1` also reads yes/no/on/off as booleans and 0755 as octal, like PyYAML. */
  schema: "1.2" | "1.1";
};

export const defaultYamlToJsonOptions: YamlToJsonOptions = { ...defaultJsonOutputOptions, schema: "1.2" };

export type YamlToJsonResult =
  | { ok: true; value: unknown; json: string; documents: number; anchors: number; notes: string[] }
  | { ok: false; error: string; line: number; column: number };

class YamlError extends Error {
  readonly at: number;
  constructor(message: string, at: number) {
    super(message);
    this.at = at;
  }
}

// Deeper nesting would overflow the call stack; real documents are nowhere near it.
const maxDepth = 1000;

// Aliases share their anchor's value, so a few lines can stand for billions of nodes ("billion laughs").
const maxNodes = 2_000_000;

// CloudFormation's short-form tags, written out the way AWS expands them.
const cfnTags: Record<string, string> = {
  Ref: "Ref", Condition: "Condition", GetAtt: "Fn::GetAtt", Base64: "Fn::Base64", Cidr: "Fn::Cidr", FindInMap: "Fn::FindInMap",
  GetAZs: "Fn::GetAZs", ImportValue: "Fn::ImportValue", Join: "Fn::Join", Select: "Fn::Select", Split: "Fn::Split", Sub: "Fn::Sub",
  Transform: "Fn::Transform", And: "Fn::And", Equals: "Fn::Equals", If: "Fn::If", Not: "Fn::Not", Or: "Fn::Or", Length: "Fn::Length",
  ToJsonString: "Fn::ToJsonString",
};

const lineColumn = (text: string, at: number) => {
  let line = 1;
  let last = -1;
  for (let i = text.indexOf("\n"); i !== -1 && i < at; i = text.indexOf("\n", i + 1)) {
    line++;
    last = i;
  }
  return { line, column: at - last };
};

const escapes: Record<string, string> = {
  "0": "\0", a: "\x07", b: "\b", t: "\t", "\t": "\t", n: "\n", v: "\v", f: "\f", r: "\r", e: "\x1b", " ": " ",
  '"': '"', "/": "/", "\\": "\\", N: "\u0085", _: " ", L: " ", P: " ",
};

// !GetAtt Resource.Attribute is the list [Resource, Attribute]; the attribute may contain dots itself.
const splitAtt = (v: string) => {
  const dot = v.indexOf(".");
  return dot === -1 ? [v] : [v.slice(0, dot), v.slice(dot + 1)];
};

const flowIndicator = (c: string | undefined) => c === "," || c === "[" || c === "]" || c === "{" || c === "}";

/** Parses YAML (every document in the stream) with its own parser and converts it to JSON. */
export function yamlToJson(input: string, options: YamlToJsonOptions = defaultYamlToJsonOptions): YamlToJsonResult {
  const s = input.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const o = options;
  const notes = new Set<string>();
  const anchors = new Map<string, unknown>();
  const sizes = new WeakMap<object, number>();
  let pos = 0;
  let nodes = 0;
  let anchorCount = 0;
  let depth = 0;
  const nested = <T,>(read: () => T): T => {
    if (++depth > maxDepth) fail(`The YAML is nested more than ${maxDepth.toLocaleString("en-US")} levels deep.`);
    const value = read();
    depth--;
    return value;
  };

  const fail = (message: string, at = pos): never => {
    throw new YamlError(message, at);
  };

  const lineStart = (p: number) => s.lastIndexOf("\n", p - 1) + 1;
  const column = (p: number) => p - lineStart(p);
  const isBreak = (c: string | undefined) => c === undefined || c === "\n";
  const isSpace = (c: string | undefined) => c === " " || c === "\t";
  // A character that ends an indicator such as "-", ":" or "?".
  const isSep = (p: number) => isBreak(s[p]) || isSpace(s[p]);
  const isDocMarker = (p: number) => column(p) === 0 && (s.startsWith("---", p) || s.startsWith("...", p)) && isSep(p + 3);

  const skipSpaces = () => {
    while (isSpace(s[pos])) pos++;
  };
  const skipComment = () => {
    if (s[pos] === "#") while (!isBreak(s[pos])) pos++;
  };
  // Skips spaces, comments and line breaks up to the next content, rejecting tabs used as indentation.
  const skipBlank = () => {
    for (;;) {
      skipSpaces();
      skipComment();
      if (s[pos] !== "\n") return;
      pos++;
      let p = pos;
      while (s[p] === " ") p++;
      if (s[p] === "\t") {
        let q = p;
        while (isSpace(s[q])) q++;
        if (!isBreak(s[q]) && s[q] !== "#") fail("Tabs can't be used for indentation in YAML; use spaces.", p);
      }
    }
  };

  const sizeOf = (v: unknown): number => {
    if (v === null || typeof v !== "object") return 1;
    const cached = sizes.get(v);
    if (cached !== undefined) return cached;
    let n = 1;
    for (const x of Object.values(v)) n += sizeOf(x);
    sizes.set(v, n);
    return n;
  };
  const count = (n: number) => {
    nodes += n;
    if (nodes > maxNodes) fail("Aliases expand to more than two million values, so the document was rejected.");
  };

  const isOctal11 = (t: string) => o.schema === "1.1" && /^[-+]?0[0-7]+$/.test(t);

  // Resolves an untagged plain scalar to null, a boolean, a number or a string.
  const resolve = (t: string): unknown => {
    if (/^(?:null|Null|NULL|~)?$/.test(t)) return null;
    if (/^(?:true|True|TRUE)$/.test(t)) return true;
    if (/^(?:false|False|FALSE)$/.test(t)) return false;
    if (o.schema === "1.1") {
      if (/^(?:y|Y|yes|Yes|YES|on|On|ON)$/.test(t)) return true;
      if (/^(?:n|N|no|No|NO|off|Off|OFF)$/.test(t)) return false;
    }
    let n: number | undefined;
    if (/^[-+]?[0-9]+$/.test(t)) n = isOctal11(t) ? parseInt(t, 8) : Number(t);
    else if (/^0o[0-7]+$/.test(t)) n = parseInt(t.slice(2), 8);
    else if (/^0x[0-9a-fA-F]+$/.test(t)) n = parseInt(t.slice(2), 16);
    else if (o.schema === "1.1" && /^[-+]?[0-9][0-9_]*$/.test(t)) n = Number(t.replace(/_/g, ""));
    else if (/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)(?:[eE][-+]?[0-9]+)?$/.test(t)) n = Number(t);
    else if (/^[-+]?\.(?:inf|Inf|INF)$|^\.(?:nan|NaN|NAN)$/.test(t)) {
      notes.add("JSON has no infinity or NaN, so values like .inf and .nan were kept as strings.");
      return t;
    }
    if (n === undefined) return t;
    if (Number.isInteger(n) && !Number.isSafeInteger(n)) {
      notes.add("Integers too large for JSON numbers to hold exactly were kept as strings.");
      return t;
    }
    return n;
  };

  const applyTag = (tag: string | undefined, value: unknown, raw: string | undefined, at: number): unknown => {
    if (!tag) return value;
    const t = tag.replace(/^!!/, "tag:yaml.org,2002:").replace(/^!<(.*)>$/, "$1");
    if (t.startsWith("tag:yaml.org,2002:")) {
      const name = t.slice(18);
      if (name === "str") return raw ?? (typeof value === "string" ? value : JSON.stringify(value));
      if (name === "int" || name === "float") {
        const n = resolve(raw ?? String(value));
        if (typeof n !== "number") fail(`!!${name} needs a number, but found ${JSON.stringify(raw ?? value)}.`, at);
        return n;
      }
      if (name === "bool") {
        const b = resolve(raw ?? String(value));
        if (typeof b !== "boolean") fail(`!!bool needs true or false, but found ${JSON.stringify(raw ?? value)}.`, at);
        return b;
      }
      if (name === "null") return null;
      return value; // map, seq, set, omap, binary, timestamp: kept as parsed
    }
    const short = tag.startsWith("!") && !tag.startsWith("!!") ? tag.slice(1) : "";
    if (short in cfnTags) {
      notes.add("CloudFormation short tags such as !Ref and !Sub were expanded to their full form (Ref, Fn::Sub, …).");
      const fn = cfnTags[short];
      return { [fn]: short === "GetAtt" && typeof value === "string" ? splitAtt(value) : value };
    }
    notes.add(`Custom tags such as ${tag} have no JSON equivalent and were left out; the tagged values were kept.`);
    return value;
  };

  // Anchors (&name) and tags (!tag) in front of a node, in either order.
  const properties = () => {
    let anchor: string | undefined;
    let tag: string | undefined;
    let at = pos;
    for (;;) {
      if (s[pos] === "&" && !anchor) {
        const m = /^&([^\s,[\]{}]+)/.exec(s.slice(pos, pos + 256));
        if (!m) fail("An anchor (&) needs a name.");
        anchor = m![1];
        pos += m![0].length;
      } else if (s[pos] === "!" && !tag) {
        at = pos;
        const m = /^!(?:<[^>]*>|[^\s,[\]{}]*)/.exec(s.slice(pos, pos + 256));
        tag = m![0];
        pos += tag.length;
      } else break;
      skipSpaces();
    }
    return { anchor, tag, at };
  };

  const finish = (props: { anchor?: string; tag?: string; at: number }, value: unknown, raw?: string) => {
    const v = applyTag(props.tag, value, raw, props.at);
    if (props.anchor) {
      anchors.set(props.anchor, v);
      anchorCount++;
    }
    count(1);
    return v;
  };

  const alias = () => {
    const at = pos;
    const m = /^\*([^\s,[\]{}]+)/.exec(s.slice(pos, pos + 256));
    if (!m) fail("An alias (*) needs a name.");
    pos += m![0].length;
    if (!anchors.has(m![1])) fail(`*${m![1]} refers to an anchor that isn't defined before it.`, at);
    const v = anchors.get(m![1]);
    count(sizeOf(v));
    return v;
  };

  // Joins the lines of a multi-line scalar: one break becomes a space, each extra break is kept.
  const fold = (breaks: number) => (breaks > 1 ? "\n".repeat(breaks - 1) : " ");

  const doubleQuoted = (): string => {
    const start = pos++;
    let out = "";
    for (;;) {
      const c = s[pos];
      if (c === undefined) fail("This double-quoted string is never closed.", start);
      if (c === '"') {
        pos++;
        return out;
      }
      if (c === "\\") {
        const e = s[pos + 1];
        if (e === "\n") {
          pos += 2;
          while (isSpace(s[pos])) pos++;
        } else if (e in escapes) {
          out += escapes[e];
          pos += 2;
        } else if (e === "x" || e === "u" || e === "U") {
          const len = e === "x" ? 2 : e === "u" ? 4 : 8;
          const hex = s.slice(pos + 2, pos + 2 + len);
          if (!new RegExp(`^[0-9a-fA-F]{${len}}$`).test(hex)) fail(`\\${e} needs ${len} hex digits.`);
          out += String.fromCodePoint(parseInt(hex, 16));
          pos += 2 + len;
        } else fail(`Unknown escape \\${e ?? ""} in a double-quoted string.`);
      } else if (c === "\n") {
        out = out.replace(/[ \t]+$/, "");
        let breaks = 0;
        while (s[pos] === "\n") {
          breaks++;
          pos++;
          while (isSpace(s[pos])) pos++;
        }
        out += fold(breaks);
      } else {
        out += c;
        pos++;
      }
    }
  };

  const singleQuoted = (): string => {
    const start = pos++;
    let out = "";
    for (;;) {
      const c = s[pos];
      if (c === undefined) fail("This single-quoted string is never closed.", start);
      if (c === "'") {
        if (s[pos + 1] === "'") {
          out += "'";
          pos += 2;
          continue;
        }
        pos++;
        return out;
      }
      if (c === "\n") {
        out = out.replace(/[ \t]+$/, "");
        let breaks = 0;
        while (s[pos] === "\n") {
          breaks++;
          pos++;
          while (isSpace(s[pos])) pos++;
        }
        out += fold(breaks);
      } else {
        out += c;
        pos++;
      }
    }
  };

  // Where a plain scalar ends on the current line: at a comment, at ": " (or ": " in flow), or a flow indicator.
  const plainLineEnd = (from: number, flow: boolean) => {
    let p = from;
    for (; !isBreak(s[p]); p++) {
      const c = s[p];
      if (c === "#" && isSpace(s[p - 1])) break;
      if (c === ":" && (isSep(p + 1) || (flow && flowIndicator(s[p + 1])))) break;
      if (flow && flowIndicator(c)) break;
    }
    let end = p;
    while (end > from && isSpace(s[end - 1])) end--;
    return { end, stop: p };
  };

  // A plain (unquoted) scalar; in block context it continues on lines indented past `parent`.
  const plain = (parent: number, flow: boolean): string => {
    let { end, stop } = plainLineEnd(pos, flow);
    let out = s.slice(pos, end);
    pos = stop;
    for (;;) {
      if (!isBreak(s[pos]) || s[pos] === undefined) return out;
      // Look ahead for a continuation line.
      let p = pos;
      let breaks = 0;
      while (s[p] === "\n") {
        breaks++;
        p++;
        while (isSpace(s[p])) p++;
      }
      if (s[p] === undefined || s[p] === "#" || isDocMarker(p)) return out;
      if (flow ? flowIndicator(s[p]) || (s[p] === ":" && (isSep(p + 1) || flowIndicator(s[p + 1]))) : column(p) <= parent) return out;
      ({ end, stop } = plainLineEnd(p, flow));
      if (end === p) return out;
      out += fold(breaks) + s.slice(p, end);
      pos = stop;
      if (!flow && s[stop] === ":") fail("A plain value can't continue onto a line with “key:” on it; start the mapping on its own line.", stop);
    }
  };

  // A literal (|) or folded (>) block scalar.
  const blockScalar = (parent: number): string => {
    const folded = s[pos] === ">";
    pos++;
    let chomp: "clip" | "strip" | "keep" = "clip";
    let explicit = 0;
    for (let k = 0; k < 2; k++) {
      if (s[pos] === "-" || s[pos] === "+") chomp = s[pos++] === "-" ? "strip" : "keep";
      else if (/[1-9]/.test(s[pos] ?? "")) explicit = Number(s[pos++]);
    }
    skipSpaces();
    if (s[pos] === "#" && !isSpace(s[pos - 1])) fail("A comment after | or > needs a space before the #.");
    skipComment();
    if (!isBreak(s[pos])) fail("Only a comment can follow the | or > that starts a block scalar.");
    if (s[pos] === "\n") pos++;

    const base = Math.max(parent, 0);
    let indent = explicit ? base + explicit : 0;
    const lines: string[] = [];
    while (pos < s.length) {
      const eol = s.indexOf("\n", pos) === -1 ? s.length : s.indexOf("\n", pos);
      const line = s.slice(pos, eol);
      if (column(pos) === 0 && isDocMarker(pos)) break;
      let lead = 0;
      while (line[lead] === " ") lead++;
      if (lead === line.length || (!indent && line.trim() === "")) {
        // An empty or whitespace-only line belongs to the scalar until a less indented line ends it.
        lines.push(indent ? line.slice(indent) : "");
      } else {
        if (!indent) {
          if (lead <= parent) break;
          indent = lead;
        }
        if (lead < indent) break;
        lines.push(line.slice(indent));
      }
      pos = eol < s.length ? eol + 1 : eol;
    }
    // `pos` is now at the start of the line that ended the scalar, which the caller reads next.
    let last = lines.length;
    while (last > 0 && lines[last - 1].trim() === "") last--;
    const content = lines.slice(0, last);
    const trailing = lines.length - last;
    let body: string;
    if (!folded) body = content.join("\n");
    else {
      body = "";
      // Lines are joined with spaces, except around blank lines and more-indented lines, which keep their breaks.
      let first = true;
      let prevMore = false;
      let empty = 0;
      for (const line of content) {
        if (line === "") {
          empty++;
          continue;
        }
        const more = isSpace(line[0]);
        if (first) body += "\n".repeat(empty);
        else if (more || prevMore) body += "\n".repeat(empty + 1);
        else body += empty ? "\n".repeat(empty) : " ";
        body += line;
        first = false;
        prevMore = more;
        empty = 0;
      }
    }
    if (!content.length) return chomp === "keep" ? "\n".repeat(trailing) : "";
    if (chomp === "strip") return body;
    if (chomp === "keep") return `${body}\n${"\n".repeat(trailing)}`;
    return `${body}\n`;
  };

  const skipFlowBlank = () => {
    for (;;) {
      while (isSpace(s[pos]) || s[pos] === "\n") pos++;
      if (s[pos] === "#") skipComment();
      else return;
    }
  };

  const flowNode = (): unknown => {
    const props = properties();
    const c = s[pos];
    if (c === "*") return alias();
    if (c === "[" || c === "{") return finish(props, nested(flowCollection));
    if (c === '"') return finish(props, doubleQuoted(), undefined);
    if (c === "'") return finish(props, singleQuoted(), undefined);
    if (c === undefined || flowIndicator(c) || (c === ":" && (isSep(pos + 1) || flowIndicator(s[pos + 1])))) return finish(props, null, "");
    const raw = plain(0, true);
    return finish(props, props.tag ? raw : resolve(raw), raw);
  };

  const keyString = (k: unknown, at: number) => {
    if (k !== null && typeof k === "object") fail("A mapping key can't be a list or a mapping in JSON.", at);
    return typeof k === "string" ? k : String(k);
  };

  const flowCollection = (): unknown => {
    const start = pos;
    const seq = s[pos] === "[";
    const close = seq ? "]" : "}";
    pos++;
    const arr: unknown[] = [];
    const obj: Record<string, unknown> = {};
    for (;;) {
      skipFlowBlank();
      if (s[pos] === undefined) fail(`This ${seq ? "[" : "{"} is never closed with ${close}.`, start);
      if (s[pos] === close) {
        pos++;
        return seq ? arr : obj;
      }
      if (s[pos] === "?" && isSep(pos + 1)) pos++;
      const at = pos;
      skipFlowBlank();
      const key = flowNode();
      skipFlowBlank();
      let value: unknown = undefined;
      if (s[pos] === ":") {
        pos++;
        skipFlowBlank();
        value = s[pos] === "," || s[pos] === close ? null : flowNode();
        skipFlowBlank();
      }
      if (seq) {
        if (value === undefined) arr.push(key);
        else {
          const pair: Record<string, unknown> = {};
          setKey(pair, keyString(key, at), value);
          arr.push(pair);
        }
      } else {
        const k = keyString(key, at);
        if (Object.prototype.hasOwnProperty.call(obj, k)) fail(`The key ${JSON.stringify(k)} appears twice in this mapping.`, at);
        setKey(obj, k, value === undefined ? null : value);
      }
      if (s[pos] === ",") pos++;
      else if (s[pos] !== close) fail(`Expected “,” or “${close}” here.`);
    }
  };

  // Whether the content at `p` is a block mapping key ("key:" followed by a space or line end) on this line.
  const isMappingKey = (p: number) => {
    const c = s[p];
    if (c === "?" && isSep(p + 1)) fail("Complex keys (“? ”) aren't supported; JSON keys must be strings.", p);
    let q = p;
    if (c === '"' || c === "'") {
      for (q++; ; q++) {
        if (isBreak(s[q])) return false;
        if (c === '"' && s[q] === "\\") q++;
        else if (c === "'" && s[q] === "'" && s[q + 1] === "'") q++;
        else if (s[q] === c) break;
      }
      q++;
      while (isSpace(s[q])) q++;
      return s[q] === ":" && isSep(q + 1);
    }
    if (c === "[" || c === "{" || c === "#" || c === "|" || c === ">" || c === "%" || c === "@" || c === "`") return false;
    if (c === "-" && isSep(p + 1)) return false;
    const { stop } = plainLineEnd(p, false);
    return s[stop] === ":" && isSep(stop + 1) && stop > p;
  };

  const mappingKey = (): string => {
    const c = s[pos];
    const at = pos;
    let key: unknown;
    if (c === "*") key = alias();
    else if (c === '"') key = doubleQuoted();
    else if (c === "'") key = singleQuoted();
    else {
      const props = properties();
      const { end, stop } = plainLineEnd(pos, false);
      const raw = s.slice(pos, end);
      pos = stop;
      key = props.tag ? applyTag(props.tag, raw, raw, props.at) : raw;
      if (props.anchor) anchors.set(props.anchor, key);
    }
    skipSpaces();
    if (s[pos] !== ":") fail("Expected “:” after the key.");
    pos++;
    return keyString(key, at);
  };

  // A value after "key:" or "- ": on the same line, or on the following lines indented past `indent`.
  const valueAfter = (indent: number, inSeq: boolean): unknown => {
    skipSpaces();
    if (s[pos] === "#" || isBreak(s[pos])) {
      skipBlank();
      if (pos >= s.length || isDocMarker(pos)) return null;
      const c = column(pos);
      if (c > indent) return blockNode(indent, false);
      // A list may sit at the same indentation as its key.
      if (c === indent && !inSeq && s[pos] === "-" && isSep(pos + 1)) return blockSequence(c);
      return null;
    }
    return blockNode(indent, inSeq ? "seq" : "map");
  };

  const blockMapping = (indent: number): Record<string, unknown> => {
    const obj: Record<string, unknown> = {};
    const explicit = new Set<string>();
    for (;;) {
      const at = pos;
      const key = mappingKey();
      const value = valueAfter(indent, false);
      if (key === "<<" && (isPlainObject(value) || Array.isArray(value))) {
        // Merge keys copy keys the mapping doesn't set itself.
        for (const source of Array.isArray(value) ? value : [value]) {
          if (!isPlainObject(source)) fail("<< merges mappings, or a list of mappings.", at);
          for (const [k, v] of Object.entries(source)) if (!explicit.has(k) && !Object.prototype.hasOwnProperty.call(obj, k)) setKey(obj, k, v);
        }
      } else {
        if (explicit.has(key)) fail(`The key ${JSON.stringify(key)} appears twice in this mapping.`, at);
        explicit.add(key);
        setKey(obj, key, value);
      }
      skipBlank();
      if (pos >= s.length || isDocMarker(pos)) return obj;
      const c = column(pos);
      if (c < indent) return obj;
      if (c === indent) {
        if (s[pos] === "-" && isSep(pos + 1)) return obj;
        if (!isMappingKey(pos)) fail("Expected “key: value” at this indentation.");
        continue;
      }
      fail("This line is indented more than the keys around it. Check the indentation, or a missing “:” or “-” above.");
    }
  };

  const blockSequence = (indent: number): unknown[] => {
    const arr: unknown[] = [];
    for (;;) {
      pos++;
      arr.push(valueAfter(indent, true));
      skipBlank();
      if (pos >= s.length || isDocMarker(pos)) return arr;
      const c = column(pos);
      if (c === indent && s[pos] === "-" && isSep(pos + 1)) continue;
      if (c <= indent) return arr;
      fail("This line is indented more than the list items around it.");
    }
  };

  // A block node whose first character is at `pos`. `inline` says it follows "- " or "key: " on the same line.
  const blockNode = (parent: number, inline: "seq" | "map" | false): unknown => {
    const props = properties();
    if ((props.anchor || props.tag) && (s[pos] === "#" || isBreak(s[pos]))) {
      // The node itself starts on the next line.
      skipBlank();
      if (pos < s.length && !isDocMarker(pos)) {
        const c = column(pos);
        if (c > parent) return finish(props, blockNode(parent, false));
        if (c === parent && inline === "map" && s[pos] === "-" && isSep(pos + 1)) return finish(props, blockSequence(c));
      }
      return finish(props, null, "");
    }
    // Text left on the line after a scalar, flow collection or alias is an error.
    const end = <T,>(value: T): T => {
      skipSpaces();
      if (!isBreak(s[pos]) && s[pos] !== "#") fail("Unexpected text after the value. Quote the value if it's meant to contain this.");
      return value;
    };
    const c = s[pos];
    const col = column(pos);
    if (c === "*") {
      if (isMappingKey(pos)) return finish(props, nested(() => blockMapping(col)));
      return end(alias());
    }
    if (c === "-" && isSep(pos + 1)) {
      if (inline === "map") fail("A list can't start on the same line as its key; put “- ” on the next line.");
      return finish(props, nested(() => blockSequence(col)));
    }
    if (c === "|" || c === ">") return finish(props, blockScalar(parent));
    if (isMappingKey(pos)) {
      if (inline === "map") fail("A mapping can't start on the same line as its key; put it on the next line, indented.");
      return finish(props, nested(() => blockMapping(col)));
    }
    if (c === "[" || c === "{") return end(finish(props, nested(flowCollection)));
    if (c === '"') return end(finish(props, doubleQuoted(), undefined));
    if (c === "'") return end(finish(props, singleQuoted(), undefined));
    if (c === "%" || c === "@" || c === "`") fail(`A value can't start with “${c}” unless it's quoted.`);
    const raw = plain(parent, false);
    return end(finish(props, props.tag ? raw : resolve(raw), raw));
  };

  try {
    const docs: unknown[] = [];
    for (;;) {
      skipBlank();
      while (column(pos) === 0 && s[pos] === "%") {
        while (!isBreak(s[pos])) pos++;
        skipBlank();
      }
      if (pos >= s.length) break;
      if (isDocMarker(pos) && s.startsWith("...", pos)) {
        pos += 3;
        continue;
      }
      let explicitStart = false;
      if (isDocMarker(pos)) {
        pos += 3;
        explicitStart = true;
        skipSpaces();
        skipComment();
      }
      anchors.clear();
      if (isBreak(s[pos])) skipBlank();
      if (pos >= s.length || isDocMarker(pos)) {
        if (explicitStart) docs.push(null);
      } else docs.push(blockNode(-1, false));
      skipBlank();
      if (pos >= s.length) break;
      if (isDocMarker(pos)) continue;
      fail("Unexpected content after the end of the value. Check the indentation of this line.");
    }

    const documents = docs.length;
    if (documents > 1) notes.add(`The YAML holds ${documents} documents (separated by ---), so the JSON is an array with one item per document.`);
    const value = documents === 0 ? null : documents === 1 ? docs[0] : docs;
    let json: string;
    try {
      json = formatJson(value, o);
    } catch {
      return fail("The YAML is nested too deeply to write as JSON.", 0);
    }
    return { ok: true, value, json, documents, anchors: anchorCount, notes: [...notes] };
  } catch (e) {
    if (!(e instanceof YamlError)) throw e;
    return { ok: false, error: e.message, ...lineColumn(s, Math.min(e.at, s.length)) };
  }
}
