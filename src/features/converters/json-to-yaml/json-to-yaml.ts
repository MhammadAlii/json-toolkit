import { isPlainObject } from "@/core/json/path";
import { sortDeep } from "@/core/json/sort";

export type YamlOptions = {
  indent: 2 | 4;
  /** `block` is the usual indented YAML; `flow` writes everything inline like `{a: 1, b: [x, y]}`. */
  style: "block" | "flow";
  sortKeys: boolean;
  /** Double-quote every string value, even ones that would be safe unquoted. */
  quoteStrings: boolean;
};

export const defaultYamlOptions: YamlOptions = { indent: 2, style: "block", sortKeys: false, quoteStrings: false };

// Words YAML 1.1/1.2 parsers read as booleans or null, so they must be quoted to stay strings.
const reserved = /^(?:y|yes|n|no|true|false|on|off|null|~|nan|\.nan|[-+]?\.?inf(?:inity)?)$/i;
// Strings that would parse as a number, date or time.
const numberLike = /^[-+]?(?:\d[\d_]*(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$|^0[xob][\da-f_]+$|^\d{4}-\d{2}-\d{2}(?:[t ][\d:.]+(?:z|[-+]\d{2}(?::?\d{2})?)?)?$|^\d+:\d{2}(?::\d{2})?$/i;

/** Whether a string can be written without quotes and still read back as the same string. */
function isPlainSafe(s: string, inFlow: boolean): boolean {
  if (s === "" || s !== s.trim()) return false;
  if (reserved.test(s) || numberLike.test(s)) return false;
  if (/^[-?:,[\]{}#&*!|>'"%@`]/.test(s)) return false;
  if (/: |:$| #|[\n\r\t]/.test(s)) return false;
  if (inFlow && /[,[\]{}]/.test(s)) return false;
  return true;
}

const quote = (s: string) => JSON.stringify(s); // a JSON string is a valid double-quoted YAML scalar

function scalar(v: unknown, o: YamlOptions, inFlow: boolean): string {
  if (v === null) return "null";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  const s = String(v);
  return o.quoteStrings || !isPlainSafe(s, inFlow) ? quote(s) : s;
}

const key = (k: string, inFlow: boolean) => (isPlainSafe(k, inFlow) ? k : quote(k));

function flow(v: unknown, o: YamlOptions): string {
  if (Array.isArray(v)) return `[${v.map((x) => flow(x, o)).join(", ")}]`;
  if (isPlainObject(v)) return `{${Object.entries(v).map(([k, x]) => `${key(k, true)}: ${flow(x, o)}`).join(", ")}}`;
  return scalar(v, o, true);
}

// Multi-line text reads best as a literal block: `|` keeps the final newline, `|-` drops it. Anything
// unusual (leading spaces or blank lines, tabs, several trailing newlines) is safer double-quoted.
function literal(s: string, pad: string): string | null {
  if (!s.includes("\n") || !/\S/.test(s) || /[\r\t]/.test(s) || /(^|\n) /.test(s) || s.startsWith("\n") || s.endsWith("\n\n")) return null;
  const chomp = s.endsWith("\n") ? "|" : "|-";
  const body = s.replace(/\n$/, "").split("\n").map((line) => (line ? pad + line : "")).join("\n");
  return `${chomp}\n${body}`;
}

// `pad` is this level's indentation; nested levels add `indent` spaces to it.
function block(v: unknown, o: YamlOptions, pad: string): string {
  const childPad = pad + " ".repeat(o.indent);
  const value = (x: unknown) => {
    if ((Array.isArray(x) || isPlainObject(x)) && Object.keys(x).length) return `\n${block(x, o, childPad)}`;
    if (typeof x === "string" && !o.quoteStrings) {
      const lit = literal(x, childPad);
      if (lit) return ` ${lit}`;
    }
    return ` ${Array.isArray(x) || isPlainObject(x) ? flow(x, o) : scalar(x, o, false)}`;
  };
  if (Array.isArray(v)) {
    return v
      .map((item) => {
        if (isPlainObject(item) && Object.keys(item).length) {
          // The first key sits on the dash line, and the rest line up under it, two columns past the dash.
          const inner = block(item, o, `${pad}  `);
          return `${pad}- ${inner.slice(pad.length + 2)}`;
        }
        return `${pad}-${value(item)}`;
      })
      .join("\n");
  }
  if (isPlainObject(v)) return Object.entries(v).map(([k, x]) => `${pad}${key(k, false)}:${value(x)}`).join("\n");
  return pad + value(v).trimStart();
}

export function toYaml(value: unknown, options: YamlOptions = defaultYamlOptions): string {
  const v = options.sortKeys ? sortDeep(value) : value;
  if (options.style === "flow") return flow(v, options);
  if ((Array.isArray(v) || isPlainObject(v)) && Object.keys(v).length === 0) return Array.isArray(v) ? "[]" : "{}";
  return block(v, options, "");
}
