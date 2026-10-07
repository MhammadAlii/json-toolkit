import { fromParse, type TransformResult } from "@/core/json/parse";

const YAML_PLAIN = /^[A-Za-z_][\w .\/-]*$/;
const YAML_RESERVED = /^(true|false|yes|no|on|off|null|~|y|n)$/i;

function yamlScalar(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  const s = String(v);
  if (s !== "" && YAML_PLAIN.test(s) && !YAML_RESERVED.test(s) && !/\s$/.test(s)) return s;
  return JSON.stringify(s); // double-quoted JSON strings are valid YAML
}

function yamlKey(k: string): string {
  return YAML_PLAIN.test(k) && !YAML_RESERVED.test(k) ? k : JSON.stringify(k);
}

function toYaml(v: unknown, indent: number): string {
  const pad = " ".repeat(indent);
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    return v
      .map((item) => {
        if (item && typeof item === "object" && Object.keys(item).length > 0) {
          const nested = toYaml(item, indent + 2);
          return `${pad}- ${nested.trimStart()}`;
        }
        return `${pad}- ${item && typeof item === "object" ? toYaml(item, 0) : yamlScalar(item)}`;
      })
      .join("\n");
  }
  if (v && typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, val]) => {
        if (val && typeof val === "object" && Object.keys(val).length > 0) {
          return `${pad}${yamlKey(k)}:\n${toYaml(val, indent + 2)}`;
        }
        return `${pad}${yamlKey(k)}: ${val && typeof val === "object" ? toYaml(val, 0) : yamlScalar(val)}`;
      })
      .join("\n");
  }
  return `${pad}${yamlScalar(v)}`;
}

export function jsonToYaml(input: string): TransformResult {
  return fromParse(input, (value) => ({ ok: true, output: toYaml(value, 0) }));
}
