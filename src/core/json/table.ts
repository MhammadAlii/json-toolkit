import { matchesQuery } from "@/core/text/matches-query";
import { isPlainObject, type PathSegment } from "@/core/json/path";

export type TableRow = { path: PathSegment[]; cells: Record<string, unknown> };
export type JsonTable = { kind: "records" | "list" | "entries"; columns: string[]; rows: TableRow[] };

// Arrays of objects get a column per key; other arrays and objects become two-column tables.
export function buildTable(value: unknown): JsonTable | null {
  if (Array.isArray(value) && value.length > 0 && value.every(isPlainObject)) {
    const columns = [...new Set(value.flatMap((r) => Object.keys(r)))];
    return { kind: "records", columns, rows: value.map((cells, i) => ({ path: [i], cells })) };
  }
  if (Array.isArray(value)) return { kind: "list", columns: ["value"], rows: value.map((v, i) => ({ path: [i], cells: { value: v } })) };
  if (isPlainObject(value)) {
    return { kind: "entries", columns: ["key", "value"], rows: Object.entries(value).map(([key, v]) => ({ path: [key], cells: { key, value: v } })) };
  }
  return null;
}

export function cellPath(table: JsonTable, row: TableRow, column: string): PathSegment[] {
  return table.kind === "records" ? [...row.path, column] : row.path;
}

export function cellText(value: unknown): string {
  if (value === undefined) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function filterRows(rows: TableRow[], query: string, columns: string[]): TableRow[] {
  if (!query.trim()) return rows;
  return rows.filter((row) => matchesQuery(columns.map((c) => cellText(row.cells[c])).join(" "), query));
}

// Rows as plain objects limited to the given columns, ready for export.
export function projectRows(rows: TableRow[], columns: string[]): Record<string, unknown>[] {
  return rows.map(({ cells }) => Object.fromEntries(columns.filter((c) => c in cells).map((c) => [c, cells[c]])));
}
