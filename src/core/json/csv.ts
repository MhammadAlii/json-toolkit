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

export function toCsv(items: unknown[], delimiter: Delimiter = ","): { csv: string; rows: number; columns: number } {
  const rows = items.map((row) => flatten(row));
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [headers.map((h) => csvCell(h, delimiter)).join(delimiter)];
  for (const row of rows) lines.push(headers.map((h) => csvCell(row[h], delimiter)).join(delimiter));
  return { csv: lines.join("\n"), rows: rows.length, columns: headers.length };
}
