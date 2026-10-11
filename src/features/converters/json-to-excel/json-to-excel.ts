import { tabulate, type TableOptions } from "@/core/json/csv";
import { isPlainObject } from "@/core/json/path";
import { buildXlsx, maxCellText, maxColumns, maxRows, sheetNames, type XlsxCell, type XlsxLayout, type XlsxSheet } from "./xlsx";

export type ExcelOptions = TableOptions &
  XlsxLayout & {
    sheetName: string;
    /** Writes ISO 8601 date strings as real Excel dates. */
    dates: boolean;
  };

export const defaultExcelOptions: ExcelOptions = {
  sheetName: "Sheet1",
  headers: true,
  freezeHeader: true,
  autoFilter: true,
  dates: true,
  flatten: true,
  arrays: "json",
  sortColumns: false,
};

export type ExcelConversion = {
  sheets: XlsxSheet[];
  rows: number;
  columns: number;
  notes: string[];
  /** Set when the input isn't an array of objects, which is what a sheet represents best. */
  warning?: string;
  /** Top-level properties holding arrays of objects, which could be converted instead of the whole input. */
  suggestions: { key: string; rows: number }[];
};

/** What to convert: the whole value, one top-level array property, or every such property as its own sheet. */
export type ExcelSource = { kind: "all" } | { kind: "key"; key: string } | { kind: "sheets" };

const isRecords = (v: unknown): v is Record<string, unknown>[] => Array.isArray(v) && v.length > 0 && v.every(isPlainObject);

const isoDate = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

// Excel stores dates as days since 1899-12-30, and can't show dates before 1900.
function excelDate(text: string): XlsxCell | undefined {
  const m = isoDate.exec(text);
  if (!m) return undefined;
  const [, y, mo, d, h = "0", mi = "0", s = "0", frac = "", zone] = m;
  const ms = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s, Math.round(Number(frac || 0) * 1000));
  const check = new Date(ms);
  if (+y < 1900 || check.getUTCMonth() !== +mo - 1 || check.getUTCDate() !== +d || +h > 23 || +mi > 59 || +s > 59) return undefined;
  // Excel has no time zones; times with an offset are shown in UTC.
  let utc = ms;
  if (zone && zone !== "Z") {
    const sign = zone[0] === "-" ? -1 : 1;
    const [oh, om] = [zone.slice(1, 3), zone.slice(-2)].map(Number);
    utc -= sign * (oh * 60 + om) * 60000;
  }
  return { serial: Math.round((utc / 86400000 + 25569) * 1e8) / 1e8, time: m[4] !== undefined };
}

function toCell(value: unknown, o: ExcelOptions, truncated: { count: number }): XlsxCell {
  if (value === undefined || value === null) return null;
  if (typeof value === "number" || typeof value === "boolean") return value;
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (typeof value === "string" && o.dates) {
    const date = excelDate(value);
    if (date) return date;
  }
  if (text.length > maxCellText) {
    truncated.count++;
    return text.slice(0, maxCellText);
  }
  return text;
}

function toSheet(name: string, source: unknown, o: ExcelOptions, notes: string[]): XlsxSheet {
  const items = Array.isArray(source) ? source : [source];
  const table = tabulate(items, o);
  const truncated = { count: 0 };
  let headers = table.headers;
  let values = table.values;
  if (headers.length > maxColumns) {
    notes.push(`“${name}” has ${headers.length.toLocaleString()} columns; Excel allows ${maxColumns.toLocaleString()}, so the rest are left out.`);
    headers = headers.slice(0, maxColumns);
    values = values.map((r) => r.slice(0, maxColumns));
  }
  const rowLimit = maxRows - (o.headers ? 1 : 0);
  if (values.length > rowLimit) {
    notes.push(`“${name}” has ${values.length.toLocaleString()} rows; Excel allows ${rowLimit.toLocaleString()}, so the rest are left out.`);
    values = values.slice(0, rowLimit);
  }
  const rows = values.map((r) => r.map((v) => toCell(v, o, truncated)));
  if (truncated.count) notes.push(`${truncated.count.toLocaleString()} cell(s) in “${name}” were cut to Excel's limit of ${maxCellText.toLocaleString()} characters.`);
  return { name, headers, rows };
}

export function jsonToExcel(value: unknown, options: ExcelOptions, source: ExcelSource = { kind: "all" }): ExcelConversion {
  const suggestions = isPlainObject(value)
    ? Object.entries(value)
        .filter(([, v]) => isRecords(v))
        .map(([key, v]) => ({ key, rows: (v as unknown[]).length }))
    : [];
  const notes: string[] = [];

  const parts: { name: string; data: unknown }[] =
    source.kind === "sheets" && isPlainObject(value) && suggestions.length > 0
      ? suggestions.map((s) => ({ name: s.key, data: value[s.key] }))
      : source.kind === "key" && isPlainObject(value) && Array.isArray(value[source.key])
        ? [{ name: options.sheetName, data: value[source.key] }]
        : [{ name: options.sheetName, data: value }];
  const names = sheetNames(parts.map((p) => p.name));
  const sheets = parts.map((p, i) => toSheet(names[i], p.data, options, notes));

  const main = parts.length === 1 ? parts[0].data : undefined;
  const warning =
    parts.length > 1 || isRecords(main)
      ? undefined
      : Array.isArray(main)
        ? main.length === 0
          ? "The array is empty, so there are no rows."
          : "Excel works best with an array of objects; other items are written to a single value column."
        : "Excel works best with an array of objects; this object is written as a single row.";

  return {
    sheets,
    rows: sheets.reduce((n, s) => n + s.rows.length, 0),
    columns: Math.max(0, ...sheets.map((s) => s.headers.length)),
    notes,
    warning,
    suggestions,
  };
}

export const excelFile = (sheets: XlsxSheet[], options: ExcelOptions) => buildXlsx(sheets, options);

const pad = (n: number, size = 2) => String(n).padStart(size, "0");

/** How a cell reads in the preview and when copied: dates as ISO text, empty cells as "". */
export function cellLabel(cell: XlsxCell): string {
  if (cell === null) return "";
  if (typeof cell !== "object") return String(cell);
  const d = new Date(Math.round((cell.serial - 25569) * 86400000));
  const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  return cell.time ? `${date} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}` : date;
}

/** Tab-separated text of a sheet, which pastes straight into Excel or Google Sheets as cells. */
export function sheetTsv(sheet: XlsxSheet, headers: boolean): string {
  const clean = (text: string) => text.replace(/[\t\r\n]+/g, " ");
  const rows = sheet.rows.map((r) => r.map((c) => clean(cellLabel(c))).join("\t"));
  return (headers ? [sheet.headers.map(clean).join("\t"), ...rows] : rows).join("\n");
}
