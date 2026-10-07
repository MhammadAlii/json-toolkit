import { fromParse, type TransformResult } from "@/core/json/parse";

export type Delimiter = "," | ";" | "\t";

/** Flattens nested objects into dot-path columns, e.g. { a: { b: 1 } } -> "a.b". */
function flatten(value: unknown, prefix = "", out: Record<string, unknown> = {}): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0 && prefix) out[prefix] = "";
    for (const [k, v] of entries) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else if (prefix) {
    out[prefix] = value;
  } else {
    out.value = value;
  }
  return out;
}

function csvCell(value: unknown, delimiter: Delimiter): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /["\r\n]/.test(s) || s.includes(delimiter) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function jsonToCsv(input: string, delimiter: Delimiter = ","): TransformResult {
  return fromParse(input, (value) => {
    const rows = (Array.isArray(value) ? value : [value]).map((row) => flatten(row));
    if (rows.length === 0) return { ok: false, error: "The JSON array is empty, so there are no rows to convert." };
    const headers: string[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      for (const k of Object.keys(row)) {
        if (!seen.has(k)) {
          seen.add(k);
          headers.push(k);
        }
      }
    }
    const lines = [headers.map((h) => csvCell(h, delimiter)).join(delimiter)];
    for (const row of rows) lines.push(headers.map((h) => csvCell(row[h], delimiter)).join(delimiter));
    return { ok: true, output: lines.join("\n"), note: `${rows.length} row(s), ${headers.length} column(s).` };
  });
}
