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

export type ParsedCsv =
  | { ok: true; rows: string[][]; delimiter: Delimiter; notes: string[] }
  | { ok: false; error: string; line: number; column: number };

const delimiters: Delimiter[] = [",", ";", "\t", "|"];

// Picks the delimiter that splits the first lines (outside quotes) into the most, and most consistent, cells.
function detectDelimiter(text: string): Delimiter {
  const sample = text.slice(0, 20_000);
  let best: Delimiter = ",";
  let bestScore = 0;
  for (const d of delimiters) {
    const counts: number[] = [];
    let n = 0;
    let quoted = false;
    for (let i = 0; i < sample.length && counts.length < 20; i++) {
      const c = sample[i];
      if (c === '"') quoted = !quoted;
      else if (!quoted && c === d) n++;
      else if (!quoted && c === "\n") {
        counts.push(n);
        n = 0;
      }
    }
    if (n || !counts.length) counts.push(n);
    const first = counts[0];
    if (!first) continue;
    const consistent = counts.filter((c) => c === first).length / counts.length;
    const score = first * consistent;
    if (score > bestScore) {
      best = d;
      bestScore = score;
    }
  }
  return best;
}

/** Reads RFC 4180 CSV: quoted cells with "" escapes and line breaks, CRLF, LF or CR line endings, any delimiter. */
export function parseCsv(input: string, delimiter: Delimiter | "auto" = "auto"): ParsedCsv {
  const s = input.replace(/^﻿/, "");
  const d = delimiter === "auto" ? detectDelimiter(s) : delimiter;
  const notes = new Set<string>();
  const rows: string[][] = [];
  let row: string[] = [];
  let i = 0;
  let line = 1;
  let lineStart = 0;
  const endRow = () => {
    // A line with nothing on it is skipped rather than read as a row with one empty cell.
    if (row.length > 1 || row[0] !== "") rows.push(row);
    row = [];
  };
  while (i <= s.length) {
    if (i === s.length) {
      if (s.length && !/[\r\n]$/.test(s)) endRow();
      break;
    }
    if (s[i] === '"') {
      const startLine = line;
      const startColumn = i - lineStart + 1;
      let cell = "";
      i++;
      for (;;) {
        const q = s.indexOf('"', i);
        if (q === -1) return { ok: false, error: "This quoted cell is never closed with a quote.", line: startLine, column: startColumn };
        const chunk = s.slice(i, q);
        for (let k = chunk.indexOf("\n"); k !== -1; k = chunk.indexOf("\n", k + 1)) {
          line++;
          lineStart = i + k + 1;
        }
        cell += chunk;
        if (s[q + 1] === '"') {
          cell += '"';
          i = q + 2;
        } else {
          i = q + 1;
          break;
        }
      }
      // Text after the closing quote is kept, as most spreadsheet apps do.
      let j = i;
      while (j < s.length && s[j] !== d && s[j] !== "\n" && s[j] !== "\r") j++;
      if (j > i) {
        notes.add("Some quoted cells have text after their closing quote; it was kept as part of the cell.");
        cell += s.slice(i, j);
      }
      i = j;
      row.push(cell.replace(/\r\n?/g, "\n"));
    } else {
      let j = i;
      while (j < s.length && s[j] !== d && s[j] !== "\n" && s[j] !== "\r") j++;
      row.push(s.slice(i, j));
      i = j;
    }
    if (s[i] === d) {
      i++;
      // A delimiter at the very end leaves one more, empty, cell; before a line break the next pass reads it.
      if (i === s.length) row.push("");
    } else if (s[i] === "\r" || s[i] === "\n") {
      i += s[i] === "\r" && s[i + 1] === "\n" ? 2 : 1;
      line++;
      lineStart = i;
      endRow();
    }
  }
  return { ok: true, rows, delimiter: d, notes: [...notes] };
}
