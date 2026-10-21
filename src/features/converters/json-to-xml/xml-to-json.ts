import { setKey } from "@/core/json/path";
import { defaultJsonOutputOptions, formatJson, type JsonOutputOptions } from "@/features/converters/shared/json-output";

export type XmlToJsonOptions = JsonOutputOptions & {
  /** `prefixed` writes attributes as `@name` keys (what JSON to XML reads back), `merged` as plain keys. */
  attributes: "prefixed" | "merged" | "omit";
  /** `repeated` makes an array only when an element name repeats; `always` puts every child in an array. */
  arrays: "repeated" | "always";
  /** `typed` turns text that reads back unchanged as a number or boolean into one, and empty elements into null. */
  values: "typed" | "strings";
  /** `text` merges CDATA into the element's text; `key` keeps it apart under `#cdata`. */
  cdata: "text" | "key";
  namespaces: "keep" | "strip";
  keepRoot: boolean;
};

export const defaultXmlToJsonOptions: XmlToJsonOptions = {
  ...defaultJsonOutputOptions,
  attributes: "prefixed",
  arrays: "repeated",
  values: "typed",
  cdata: "text",
  namespaces: "keep",
  keepRoot: true,
};

export type XmlToJsonResult =
  | { ok: true; value: unknown; json: string; elements: number; attributes: number; cdata: number; entities: number; depth: number; notes: string[] }
  | { ok: false; error: string; line: number; column: number };

class XmlError extends Error {
  readonly at: number;
  constructor(message: string, at: number) {
    super(message);
    this.at = at;
  }
}

const predefined: Record<string, string> = { lt: "<", gt: ">", amp: "&", apos: "'", quot: '"' };

// Not XML, but common in snippets copied from HTML; decoded with a note rather than rejected.
const htmlEntities: Record<string, string> = {
  nbsp: " ", copy: "©", reg: "®", trade: "™", hellip: "…", mdash: "—", ndash: "–",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", laquo: "«", raquo: "»", euro: "€",
  pound: "£", yen: "¥", cent: "¢", sect: "§", deg: "°", middot: "·", bull: "•", times: "×",
};

// Guards against entities that expand exponentially ("billion laughs").
const maxExpansion = 1_000_000;

const nameStart = /[A-Za-z_:À-￿]/;
const nameChars = /[A-Za-z0-9_:.\-·À-￿]*/y;
const space = /[ \t\n]*/y;

const isXmlChar = (c: number) => c === 0x9 || c === 0xa || c === 0xd || (c >= 0x20 && c <= 0xd7ff) || (c >= 0xe000 && c <= 0xfffd) || (c >= 0x10000 && c <= 0x10ffff);

// A text run between child elements: plain text is trimmed at its ends, CDATA is kept exactly.
type Piece = { text: string; cdata: boolean };

type Frame = {
  name: string;
  start: number;
  attrs: [string, string][];
  /** Child values by element name, in order of first appearance. */
  children: Map<string, unknown[]>;
  runs: string[];
  run: Piece[];
  cdata: string[];
};

function lineColumn(text: string, at: number) {
  let line = 1;
  let last = -1;
  for (let i = text.indexOf("\n"); i !== -1 && i < at; i = text.indexOf("\n", i + 1)) {
    line++;
    last = i;
  }
  return { line, column: at - last };
}

/** Parses XML with its own well-formedness checks and converts it to JSON. */
export function xmlToJson(input: string, options: XmlToJsonOptions = defaultXmlToJsonOptions): XmlToJsonResult {
  const s = input.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const o = options;
  const notes = new Set<string>();
  const entities = new Map<string, string>();
  const counts = { elements: 0, attributes: 0, cdata: 0, entities: 0, depth: 0 };
  let expanded = 0;

  const fail = (message: string, at: number): never => {
    throw new XmlError(message, at);
  };

  const decode = (raw: string, at: number, depth = 0): string => {
    if (!raw.includes("&")) return raw;
    let out = "";
    let i = 0;
    for (let amp = raw.indexOf("&"); amp !== -1; amp = raw.indexOf("&", i)) {
      out += raw.slice(i, amp);
      const semi = raw.indexOf(";", amp);
      const ref = semi === -1 ? "" : raw.slice(amp + 1, semi);
      const where = at + amp;
      if (!/^(#[0-9]+|#x[0-9a-fA-F]+|[A-Za-z_:][A-Za-z0-9_:.\-]*)$/.test(ref)) {
        fail("Unescaped “&”. Write it as &amp; (or wrap the text in <![CDATA[ … ]]>).", where);
      }
      counts.entities++;
      if (ref.startsWith("#")) {
        const code = ref[1] === "x" ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
        if (!isXmlChar(code)) fail(`&${ref}; isn't a character XML allows.`, where);
        out += String.fromCodePoint(code);
      } else if (ref in predefined) {
        out += predefined[ref];
      } else if (entities.has(ref)) {
        if (depth > 20) fail(`The entity &${ref}; refers to itself.`, where);
        const value = decode(entities.get(ref)!, where, depth + 1);
        expanded += value.length;
        if (expanded > maxExpansion) fail("Entities expand to more than a million characters, so the document was rejected.", where);
        out += value;
      } else if (ref in htmlEntities) {
        notes.add(`HTML entities such as &${ref}; aren't defined in XML; they were decoded anyway.`);
        out += htmlEntities[ref];
      } else {
        fail(`Unknown entity &${ref};. Declare it in the DOCTYPE, or use a character reference such as &#160;.`, where);
      }
      i = semi + 1;
    }
    return out + raw.slice(i);
  };

  const localName = (name: string) => (o.namespaces === "strip" ? name.slice(name.indexOf(":") + 1) : name);

  const typed = (text: string): unknown => {
    if (o.values === "strings") return text;
    if (text === "true") return true;
    if (text === "false") return false;
    // Only when the number writes back identically, so "007", "1.10" and long IDs stay strings.
    if (/^-?\d/.test(text)) {
      const n = Number(text);
      if (Number.isFinite(n) && String(n) === text) return n;
    }
    return text;
  };

  const add = (map: Map<string, unknown[]>, key: string, value: unknown) => {
    const list = map.get(key);
    if (list) list.push(value);
    else map.set(key, [value]);
  };

  const endRun = (f: Frame) => {
    if (!f.run.length) return;
    const pieces = f.run;
    f.run = [];
    // Only XML whitespace, so a decoded &nbsp; at either end is kept.
    if (!pieces[0].cdata) pieces[0] = { text: pieces[0].text.replace(/^[ \t\n]+/, ""), cdata: false };
    const last = pieces.length - 1;
    if (!pieces[last].cdata) pieces[last] = { text: pieces[last].text.replace(/[ \t\n]+$/, ""), cdata: false };
    const text = pieces.map((p) => p.text).join("");
    if (text || pieces.some((p) => p.cdata)) f.runs.push(text);
  };

  const valueOf = (f: Frame): unknown => {
    endRun(f);
    let nil = false;
    const attrs: [string, string][] = [];
    for (const [name, value] of f.attrs) {
      if (/:nil$/.test(name) && value === "true") {
        nil = true;
        continue;
      }
      if (o.namespaces === "strip" && (name === "xmlns" || name.startsWith("xmlns:"))) continue;
      if (o.attributes !== "omit") attrs.push([localName(name), value]);
    }
    const hasChildren = f.children.size > 0;
    if (f.runs.length > 1 || (f.runs.length && hasChildren)) notes.add("Some elements mix text and child elements; their text was joined into #text.");
    const text = f.runs.join(" ");
    if (nil && !attrs.length && !hasChildren) return null;
    if (!attrs.length && !hasChildren && !(o.cdata === "key" && f.cdata.length)) {
      return text === "" && !f.runs.length ? (o.values === "typed" ? null : "") : typed(text);
    }
    // Attributes, text and children share one map, so a merged attribute and a child with the same name become an array.
    const fields = new Map<string, unknown[]>();
    for (const [name, value] of attrs) add(fields, o.attributes === "prefixed" ? `@${name}` : name, typed(value));
    if (f.runs.length && (text !== "" || !(o.cdata === "key" && f.cdata.length))) add(fields, "#text", typed(text));
    if (o.cdata === "key" && f.cdata.length) add(fields, "#cdata", f.cdata.join(""));
    for (const [key, values] of f.children) for (const value of values) add(fields, key, value);
    const obj: Record<string, unknown> = {};
    for (const [key, values] of fields) {
      const child = f.children.has(key);
      setKey(obj, key, values.length > 1 || (child && o.arrays === "always") ? values : values[0]);
    }
    return obj;
  };

  const readName = (at: number, what: string) => {
    if (!nameStart.test(s[at] ?? "")) fail(`Expected ${what} name${s[at] ? ` but found “${s[at]}”` : ""}.`, at);
    nameChars.lastIndex = at + 1;
    nameChars.exec(s);
    return s.slice(at, nameChars.lastIndex);
  };
  const skipSpace = (at: number) => {
    space.lastIndex = at;
    space.exec(s);
    return space.lastIndex;
  };

  const doctype = (start: number) => {
    // Reads up to the closing ">", collecting general entities from the internal subset.
    let i = start + 9;
    let subset = -1;
    for (; i < s.length; i++) {
      const c = s[i];
      if (c === '"' || c === "'") {
        const end = s.indexOf(c, i + 1);
        if (end === -1) break;
        i = end;
      } else if (c === "[") subset = i;
      else if (c === "]") {
        const body = s.slice(subset + 1, i);
        for (const m of body.matchAll(/<!ENTITY\s+([A-Za-z_:][\w:.\-]*)\s+("([^"]*)"|'([^']*)')\s*>/g)) {
          if (!entities.has(m[1])) entities.set(m[1], m[3] ?? m[4]);
        }
        if (/<!ENTITY\s+[A-Za-z_:][\w:.\-]*\s+(SYSTEM|PUBLIC)/.test(body)) notes.add("External entities are never fetched; only entities defined inside the DOCTYPE are used.");
        subset = -1;
      } else if (c === ">" && subset === -1) return i + 1;
    }
    return fail("The DOCTYPE is never closed with “>”.", start);
  };

  try {
    const stack: Frame[] = [];
    let root: { name: string; value: unknown } | undefined;
    let i = 0;
    while (i < s.length) {
      const lt = s.indexOf("<", i);
      const end = lt === -1 ? s.length : lt;
      if (end > i) {
        const raw = s.slice(i, end);
        const top = stack[stack.length - 1];
        if (!top) {
          if (raw.trim()) fail(root ? "Text after the root element. An XML document has exactly one root." : "Text before the root element.", i + raw.search(/\S/));
        } else {
          if (raw.includes("]]>")) fail("“]]>” isn't allowed in text. Write it as ]]&gt;.", i + raw.indexOf("]]>"));
          const text = decode(raw, i);
          const last = top.run[top.run.length - 1];
          // Text either side of a comment is one run, so it's trimmed as a whole.
          if (last && !last.cdata) last.text += text;
          else top.run.push({ text, cdata: false });
        }
      }
      if (lt === -1) break;
      i = lt;

      if (s.startsWith("<!--", i)) {
        const close = s.indexOf("-->", i + 4);
        if (close === -1) fail("This comment is never closed with “-->”.", i);
        i = close + 3;
      } else if (s.startsWith("<![CDATA[", i)) {
        const close = s.indexOf("]]>", i + 9);
        if (close === -1) fail("This CDATA section is never closed with “]]>”.", i);
        const top = stack[stack.length - 1];
        if (!top) fail("CDATA sections must be inside the root element.", i);
        const text = s.slice(i + 9, close);
        counts.cdata++;
        if (o.cdata === "key") top.cdata.push(text);
        else top.run.push({ text, cdata: true });
        i = close + 3;
      } else if (s.startsWith("<?", i)) {
        const close = s.indexOf("?>", i + 2);
        if (close === -1) fail("This processing instruction is never closed with “?>”.", i);
        if (/^<\?xml[\s?]/i.test(s.slice(i, i + 6)) && s.slice(0, i).trim()) fail("The XML declaration must come first in the document.", i);
        i = close + 2;
      } else if (/^<!DOCTYPE/i.test(s.slice(i, i + 9))) {
        if (stack.length || root) fail("The DOCTYPE must come before the root element.", i);
        i = doctype(i);
      } else if (s.startsWith("</", i)) {
        const name = readName(i + 2, "a closing tag");
        const after = skipSpace(i + 2 + name.length);
        if (s[after] !== ">") fail(`Expected “>” to close </${name}.`, after);
        const top = stack.pop();
        if (!top) fail(`</${name}> has no matching opening tag.`, i);
        if (top!.name !== name) {
          const { line } = lineColumn(s, top!.start);
          fail(`Expected </${top!.name}> (opened on line ${line}) but found </${name}>.`, i);
        }
        finish(top!);
        i = after + 1;
      } else if (s.startsWith("<!", i)) {
        fail("Unexpected “<!”. Only comments, CDATA and a DOCTYPE start this way.", i);
      } else {
        if (root && !stack.length) fail("A second root element. An XML document has exactly one root; wrap them in one element.", i);
        const name = readName(i + 1, "an element");
        const frame: Frame = { name, start: i, attrs: [], children: new Map(), runs: [], run: [], cdata: [] };
        let j = i + 1 + name.length;
        let selfClosing = false;
        for (;;) {
          const k = skipSpace(j);
          if (s[k] === ">") {
            j = k + 1;
            break;
          }
          if (s.startsWith("/>", k)) {
            j = k + 2;
            selfClosing = true;
            break;
          }
          if (k >= s.length) fail(`<${name}> is never closed with “>”.`, i);
          if (k === j) fail(`Expected a space, “>” or “/>” in <${name}>, but found “${s[k]}”.`, k);
          const attr = readName(k, "an attribute");
          let e = skipSpace(k + attr.length);
          if (s[e] !== "=") fail(`The attribute ${attr} needs a value, e.g. ${attr}="…".`, e);
          e = skipSpace(e + 1);
          const quote = s[e];
          if (quote !== '"' && quote !== "'") fail(`The value of ${attr} must be in quotes.`, e);
          const close = s.indexOf(quote, e + 1);
          if (close === -1) fail(`The value of ${attr} is never closed with ${quote}.`, e);
          const raw = s.slice(e + 1, close);
          if (raw.includes("<")) fail(`“<” isn't allowed in the value of ${attr}. Write it as &lt;.`, e + 1 + raw.indexOf("<"));
          if (frame.attrs.some(([n]) => n === attr)) fail(`The attribute ${attr} appears twice on <${name}>.`, k);
          frame.attrs.push([attr, decode(raw, e + 1).replace(/[\t\n]/g, " ")]);
          counts.attributes++;
          j = close + 1;
        }
        counts.elements++;
        const parent = stack[stack.length - 1];
        if (parent) endRun(parent);
        if (selfClosing) finish(frame);
        else {
          stack.push(frame);
          counts.depth = Math.max(counts.depth, stack.length);
        }
        i = j;
      }
    }

    function finish(f: Frame) {
      const value = valueOf(f);
      const parent = stack[stack.length - 1];
      if (parent) add(parent.children, localName(f.name), value);
      else {
        root = { name: localName(f.name), value };
        counts.depth = Math.max(counts.depth, 1);
      }
    }

    if (stack.length) {
      const open = stack[stack.length - 1];
      fail(`<${open.name}> is never closed.`, open.start);
    }
    if (!root) fail("No root element found.", s.search(/\S|$/));

    let value = root!.value;
    if (o.keepRoot) {
      const wrapped: Record<string, unknown> = {};
      setKey(wrapped, root!.name, value);
      value = wrapped;
    }
    let json: string;
    try {
      json = formatJson(value, o);
    } catch {
      return fail(`Elements are nested ${counts.depth.toLocaleString("en-US")} levels deep, too deep to write as JSON.`, 0);
    }
    return { ok: true, value, json, ...counts, notes: [...notes] };
  } catch (e) {
    if (!(e instanceof XmlError)) throw e;
    return { ok: false, error: e.message, ...lineColumn(s, e.at) };
  }
}

