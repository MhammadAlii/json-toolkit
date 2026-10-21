import { parseCsv, type Delimiter } from "@/core/json/csv";
import { rowsToRecords, type RecordOptions } from "@/core/json/records";
import { defaultJsonOutputOptions, formatJson, type JsonOutputOptions } from "@/features/converters/shared/json-output";

export type CsvToJsonOptions = JsonOutputOptions &
  RecordOptions & {
    delimiter: Delimiter | "auto";
    /** The first row names the columns, giving an array of objects; otherwise each row is an array of cells. */
    headers: boolean;
    /** Numbers, booleans, null and JSON arrays or objects in cells become JSON values when they read back unchanged. */
    typed: boolean;
    /** Removes spaces around cells that aren't quoted. */
    trim: boolean;
  };

export const defaultCsvToJsonOptions: CsvToJsonOptions = {
  ...defaultJsonOutputOptions,
  delimiter: "auto",
  headers: true,
  typed: true,
  nested: true,
  empty: "null",
  trim: false,
};

export type CsvToJsonResult =
  | { ok: true; value: unknown; json: string; rows: number; columns: number; delimiter: Delimiter; notes: string[] }
  | { ok: false; error: string; line: number; column: number };

const delimiterNames: Record<Delimiter, string> = { ",": "comma", ";": "semicolon", "\t": "tab", "|": "pipe" };

/** A cell as a JSON value, only when writing that value back gives the same text. */
export function typedCell(text: string): unknown {
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null") return null;
  if (/^-?\d/.test(text)) {
    const n = Number(text);
    if (Number.isFinite(n) && String(n) === text) return n;
  }
  if (/^[[{]/.test(text)) {
    try {
      const v = JSON.parse(text) as unknown;
      if (v !== null && typeof v === "object") return v;
    } catch {
      // Not JSON: it stays text.
    }
  }
  return text;
}

export function csvToJson(input: string, options: CsvToJsonOptions = defaultCsvToJsonOptions): CsvToJsonResult {
  const o = options;
  const parsed = parseCsv(input, o.delimiter);
  if (!parsed.ok) return parsed;
  const notes = [...parsed.notes];
  if (o.delimiter === "auto" && parsed.delimiter !== ",") notes.push(`The cells are separated by ${delimiterNames[parsed.delimiter]}s, which was detected automatically.`);

  const cells = parsed.rows.map((row) => row.map((c) => (o.trim ? c.trim() : c)));
  const value = (c: string) => (o.typed && c !== "" ? typedCell(c) : c);
  const columns = cells.reduce((n, r) => Math.max(n, r.length), 0);

  let result: unknown[];
  let rows: number;
  if (o.headers && cells.length) {
    const [header, ...data] = cells;
    const records = rowsToRecords(header, data.map((r) => r.map(value)), o);
    notes.push(...records.notes);
    result = records.records;
    rows = data.length;
  } else {
    result = cells.map((r) => r.map((c) => (c === "" ? (o.empty === "null" ? null : "") : value(c))));
    rows = cells.length;
  }
  return { ok: true, value: result, json: formatJson(result, o), rows, columns, delimiter: parsed.delimiter, notes };
}
