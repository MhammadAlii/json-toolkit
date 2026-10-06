import { fromParse, type TransformResult } from "@/core/json/parse";
import { isPlainObject } from "@/core/json/path";

function tagName(key: string): string {
  const cleaned = key.replace(/[^A-Za-z0-9_.-]/g, "_");
  return /^[A-Za-z_]/.test(cleaned) && !/^xml/i.test(cleaned) ? cleaned : `_${cleaned}`;
}

function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);
}

function element(name: string, value: unknown, depth: number, indent: string): string {
  const pad = indent.repeat(depth);
  const tag = tagName(name);
  if (Array.isArray(value)) return value.map((item) => element(name, item, depth, indent)).join("\n");
  if (value === null || value === undefined) return `${pad}<${tag}/>`;
  if (isPlainObject(value)) {
    const children = Object.entries(value).map(([k, v]) => element(k, v, depth + 1, indent));
    return children.length ? `${pad}<${tag}>\n${children.join("\n")}\n${pad}</${tag}>` : `${pad}<${tag}/>`;
  }
  return `${pad}<${tag}>${escapeXml(String(value))}</${tag}>`;
}

export function jsonToXml(input: string, rootName = "root", indent = "  "): TransformResult {
  return fromParse(input, (value) => {
    const root = tagName(rootName || "root");
    const body = Array.isArray(value)
      ? `<${root}>\n${value.map((item) => element("item", item, 1, indent)).join("\n")}\n</${root}>`
      : isPlainObject(value)
        ? element(root, value, 0, indent)
        : `<${root}>${escapeXml(String(value))}</${root}>`;
    return { ok: true, output: `<?xml version="1.0" encoding="UTF-8"?>\n${body}` };
  });
}
