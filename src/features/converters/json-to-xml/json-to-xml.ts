import { isPlainObject } from "@/core/json/path";
import { sortDeep } from "@/core/json/sort";

export type XmlOptions = {
  indent: 0 | 2 | 4;
  rootName: string;
  /** `elements` writes every value as a child element; `attributes` writes plain values as attributes;
   *  `prefixed` turns keys starting with `@` into attributes and `#text` into element text. */
  attributes: "elements" | "attributes" | "prefixed";
  sortKeys: boolean;
  selfClosing: boolean;
  declaration: boolean;
  /** `repeat` writes one element per item; `wrap` nests items as `<item>` inside the array's element. */
  arrays: "repeat" | "wrap";
  nulls: "empty" | "omit" | "nil";
  booleans: "words" | "numbers";
  /** Leave out the root element when the JSON is an object with a single key, which then becomes the root. */
  omitRoot: boolean;
};

export const defaultXmlOptions: XmlOptions = {
  indent: 2,
  rootName: "root",
  attributes: "elements",
  sortKeys: false,
  selfClosing: true,
  declaration: true,
  arrays: "repeat",
  nulls: "empty",
  booleans: "words",
  omitRoot: false,
};

export type XmlResult = { xml: string; elements: number; attributes: number; renamed: { from: string; to: string }[]; notes: string[] };

// Characters XML 1.0 forbids anywhere in a document.
const invalidChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;
const escapeText = (s: string) => s.replace(invalidChars, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (s: string) => escapeText(s).replace(/"/g, "&quot;");

/** Turns any key into a valid XML element or attribute name. */
export function xmlName(key: string): string {
  let name = key.replace(/[^A-Za-z0-9_.\-À-�]/g, "_");
  if (!/^[A-Za-z_À-�]/.test(name)) name = `_${name}`;
  return name;
}

export function jsonToXml(value: unknown, options: XmlOptions = defaultXmlOptions): XmlResult {
  const o = options;
  const v = o.sortKeys ? sortDeep(value) : value;
  const renamed = new Map<string, string>();
  const notes: string[] = [];
  let elements = 0;
  let attributes = 0;
  let usesNil = false;
  const nl = o.indent ? "\n" : "";
  const pad = (depth: number) => " ".repeat(o.indent * depth);

  const name = (key: string) => {
    const n = xmlName(key);
    if (n !== key) renamed.set(key, n);
    return n;
  };
  const scalar = (x: unknown) => (typeof x === "boolean" && o.booleans === "numbers" ? (x ? "1" : "0") : String(x));
  const isScalar = (x: unknown) => x === null || typeof x !== "object";

  const element = (tag: string, x: unknown, depth: number): string => {
    const p = pad(depth);
    if (x === null) {
      if (o.nulls === "omit") return "";
      elements++;
      if (o.nulls === "nil") {
        usesNil = true;
        attributes++;
        return `${p}<${tag} xsi:nil="true"/>`;
      }
      return o.selfClosing ? `${p}<${tag}/>` : `${p}<${tag}></${tag}>`;
    }
    if (Array.isArray(x)) {
      if (o.arrays === "wrap") {
        elements++;
        const items = x.map((item) => element("item", item, depth + 1)).filter(Boolean);
        if (!items.length) return o.selfClosing ? `${p}<${tag}/>` : `${p}<${tag}></${tag}>`;
        return `${p}<${tag}>${nl}${items.join(nl)}${nl}${p}</${tag}>`;
      }
      // Repeated elements: an empty array leaves no trace, so it's written as one empty element.
      if (!x.length) {
        elements++;
        return o.selfClosing ? `${p}<${tag}/>` : `${p}<${tag}></${tag}>`;
      }
      return x
        .map((item) => (Array.isArray(item) ? element(tag, { item }, depth) : element(tag, item, depth)))
        .filter(Boolean)
        .join(nl);
    }
    elements++;
    if (isPlainObject(x)) {
      const attrs: string[] = [];
      const children: string[] = [];
      // Attribute names must be unique on an element, and different keys can normalise to the same name.
      const used = new Set<string>();
      const attrName = (key: string) => {
        let n = name(key);
        for (let i = 2; used.has(n); i++) n = `${name(key)}${i}`;
        if (n !== key) renamed.set(key, n);
        used.add(n);
        return n;
      };
      let text: string | undefined;
      for (const [k, child] of Object.entries(x)) {
        if (o.attributes === "prefixed" && k === "#text" && isScalar(child)) {
          text = child === null ? "" : escapeText(scalar(child));
        } else if (o.attributes === "prefixed" && k.startsWith("@") && isScalar(child)) {
          if (child === null && o.nulls === "omit") continue;
          attributes++;
          attrs.push(` ${attrName(k.slice(1) || "attr")}="${child === null ? "" : escapeAttr(scalar(child))}"`);
        } else if (o.attributes === "attributes" && isScalar(child)) {
          if (child === null && o.nulls === "omit") continue;
          attributes++;
          attrs.push(` ${attrName(k)}="${child === null ? "" : escapeAttr(scalar(child))}"`);
        } else {
          const out = element(name(k), child, depth + 1);
          if (out) children.push(out);
        }
      }
      const open = `<${tag}${attrs.join("")}`;
      if (text !== undefined && !children.length) return `${p}${open}>${text}</${tag}>`;
      if (!children.length && text === undefined) return o.selfClosing ? `${p}${open}/>` : `${p}${open}></${tag}>`;
      const inner = [...(text ? [`${pad(depth + 1)}${text}`] : []), ...children];
      return `${p}${open}>${nl}${inner.join(nl)}${nl}${p}</${tag}>`;
    }
    const s = escapeText(scalar(x));
    return s === "" && o.selfClosing ? `${p}<${tag}/>` : `${p}<${tag}>${s}</${tag}>`;
  };

  let rootTag = xmlName(o.rootName.trim() || "root");
  let body = v;
  if (o.omitRoot) {
    if (isPlainObject(v) && Object.keys(v).length === 1 && !Array.isArray(Object.values(v)[0])) {
      const [k, inner] = Object.entries(v)[0];
      rootTag = name(k);
      body = inner;
    } else notes.push("The root element was kept: leaving it out needs an object with exactly one key, or the XML would have several roots.");
  }
  let xml = Array.isArray(body) ? element(rootTag, { item: body }, 0) : element(rootTag, body, 0);
  if (!xml) xml = o.selfClosing ? `<${rootTag}/>` : `<${rootTag}></${rootTag}>`;
  if (usesNil) xml = xml.replace(/^<([^\s/>]+)/, `<$1 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`);
  if (o.declaration) xml = `<?xml version="1.0" encoding="UTF-8"?>${nl || "\n"}${xml}`;
  return { xml, elements, attributes, renamed: [...renamed].map(([from, to]) => ({ from, to })), notes };
}
