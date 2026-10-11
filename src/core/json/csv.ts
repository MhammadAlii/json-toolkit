import { isPlainObject } from "@/core/json/path";

export type Delimiter = "," | ";" | "\t" | "|";

export type CsvOptions = {
  delimiter: Delimiter;
  /** `needed` quotes only cells containing the delimiter, quotes, line breaks or edge spaces; `all` quotes every cell. */
  quoting: "needed" | "all";
  headers: boolean;
  /** Nested objects become dot-path columns (`address.city`); otherwise they're written as JSON. */
  flatten: boolean;
  /** How arrays are written: as JSON, joined into one cell, or as one column per item (`tags.0`). */
  arrays: "json" | "join" | "columns";
  /** How null is written. */
  nulls: "empty" | "null";
  sortColumns: boolean;
};

export const defaultCsvOptions: CsvOptions = {
  delimiter: ",",
  quoting: "needed",
  headers: true,
  flatten: true,
  arrays: "json",
  nulls: "empty",
  sortColumns: false,
};

export type CsvResult = { csv: string; rows: number; columns: number; headers: string[]; cells: string[][] };

export type TableOptions = Pick<CsvOptions, "flatten" | "arrays" | "sortColumns">;

/** Rows as columns of raw values, before they're written out; missing cells are `undefined`. */
export type Table = { headers: string[]; values: unknown[][] };

const isScalar = (v: unknown) => v === null || typeof v !== "object";

function flattenRow(value: unknown, o: TableOptions, prefix: string, out: Record<string, unknown>): Record<string, unknown> {
  if (isPlainObject(value) && (o.flatten || !prefix)) {
    const entries = Object.entries(value);
    if (entries.length === 0 && prefix) out[prefix] = "";
    for (const [k, v] of entries) flattenRow(v, o, prefix ? `${prefix}.${k}` : k, out);
  } else if (Array.isArray(value) && o.arrays === "columns" && prefix) {
    // An empty array adds no columns rather than an always-empty one.
    value.forEach((v, i) => flattenRow(v, o, `${prefix}.${i}`, out));
  } else if (Array.isArray(value) && o.arrays === "join" && prefix && value.every(isScalar)) {
    out[prefix] = value.map((v) => (v === null ? "" : String(v))).join(", ");
  } else {
    out[prefix || "value"] = value;
  }
  return out;
}

function text(value: unknown, o: CsvOptions): string {
  if (value === undefined) return "";
  if (value === null) return o.nulls === "null" ? "null" : "";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function quote(cell: string, o: CsvOptions): string {
  const needs = o.quoting === "all" || cell.includes(o.delimiter) || /["\r\n]/.test(cell) || /^\s|\s$/.test(cell);
  return needs ? `"${cell.replace(/"/g, '""')}"` : cell;
}

/** Flattens rows into a table the same way CSV does. Each object becomes a row; any other value becomes a row with a `value` column. */
export function tabulate(items: unknown[], options: Partial<TableOptions> = {}): Table {
  const o = { ...defaultCsvOptions, ...options };
  const rows = items.map((item) => flattenRow(isPlainObject(item) ? item : { value: item }, o, "", {}));
  let headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  if (o.sortColumns) headers = [...headers].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return { headers, values: rows.map((row) => headers.map((h) => row[h])) };
}

/** Writes rows as RFC 4180 CSV. */
export function toCsv(items: unknown[], options: Partial<CsvOptions> = {}): CsvResult {
  const o = { ...defaultCsvOptions, ...options };
  const { headers, values } = tabulate(items, o);
  const cells = values.map((r) => r.map((v) => text(v, o)));
  const lines = cells.map((r) => r.map((c) => quote(c, o)).join(o.delimiter));
  if (o.headers) lines.unshift(headers.map((h) => quote(h, o)).join(o.delimiter));
  return { csv: lines.join("\r\n"), rows: values.length, columns: headers.length, headers, cells };
}
