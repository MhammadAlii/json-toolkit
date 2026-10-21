import { unzip } from "@/core/file/unzip";
import { rowsToRecords, type RecordOptions } from "@/core/json/records";
import { setKey } from "@/core/json/path";
import { defaultJsonOutputOptions, formatJson, type JsonOutputOptions } from "@/features/converters/shared/json-output";
import type { XlsxCell } from "./xlsx";

export type ExcelToJsonOptions = JsonOutputOptions &
  RecordOptions & {
    /** The first row names the columns, giving an array of objects; otherwise each row is an array of cells. */
    headers: boolean;
    /** `one` converts the chosen sheet; `all` gives an object with one key per sheet. */
    sheets: "one" | "all";
    /** Dates as ISO 8601 text, or as Excel's serial day numbers. */
    dates: "iso" | "serial";
    /** Text cells holding a JSON array or object (as JSON to Excel writes them) become JSON again. */
    json: boolean;
  };

export const defaultExcelToJsonOptions: ExcelToJsonOptions = {
  ...defaultJsonOutputOptions,
  headers: true,
  sheets: "one",
  dates: "iso",
  json: true,
  nested: true,
  empty: "null",
};

export type WorkbookSheet = { name: string; hidden: boolean; rows: XlsxCell[][] };
export type Workbook = { sheets: WorkbookSheet[]; notes: string[] };
export type ReadWorkbook = { ok: true; book: Workbook } | { ok: false; error: string };

const entity: Record<string, string> = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };

// XML text as written by spreadsheet apps, including Excel's _xHHHH_ escapes for control characters.
const decode = (s: string) =>
  s
    .replace(/&(#x[0-9a-fA-F]+|#[0-9]+|lt|gt|amp|quot|apos);/g, (_, e: string) =>
      e[0] === "#" ? String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : entity[e],
    )
    .replace(/_x([0-9A-Fa-f]{4})_/g, (_, h: string) => String.fromCharCode(parseInt(h, 16)));

const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

// Elements can carry a namespace prefix (<x:c>), which some generators use.
const elements = (name: string) => new RegExp(`<(?:\\w+:)?${name}\\b([^>]*?)(?:/>|>([\\s\\S]*?)</(?:\\w+:)?${name}>)`, "g");

// The text of a string item: plain <t>, or rich-text runs, leaving out phonetic hints.
const itemText = (xml: string) => {
  const body = xml.replace(/<(?:\w+:)?rPh\b[\s\S]*?<\/(?:\w+:)?rPh>/g, "");
  let text = "";
  for (const m of body.matchAll(elements("t"))) text += decode(m[2] ?? "");
  return text;
};

// Built-in number formats that show a date or time; 18–21 and 45–47 are times of day.
const builtInDates = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 30, 36, 45, 46, 47, 50, 57]);
const builtInTimes = new Set([18, 19, 20, 21, 22, 45, 46, 47]);

function dateFormat(code: string): { date: boolean; time: boolean } {
  // Quoted text, escaped characters and [colour] or [$-locale] sections don't count; [h] and [mm] do.
  const bare = code.replace(/"[^"]*"|\\.|_.|\*./g, "").replace(/\[(?![hms]+\])[^\]]*\]/gi, "");
  const date = /[dmyhs]/i.test(bare) && !/^general$/i.test(code.trim());
  return { date, time: date && /[hs]/i.test(bare) };
}

const colIndex = (ref: string) => {
  let n = 0;
  for (const ch of ref.replace(/\d+$/, "").toUpperCase()) n = n * 26 + ch.charCodeAt(0) - 64;
  return n - 1;
};

const resolveTarget = (target: string) => (target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\//, "")}`).replace(/[^/]+\/\.\.\//g, "");

/** Reads every sheet of an .xlsx workbook into rows of typed cells. */
export async function readWorkbook(bytes: Uint8Array): Promise<ReadWorkbook> {
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) {
    return { ok: false, error: "This is an old .xls workbook or a password-protected file. Open it in Excel and save it as .xlsx (Excel Workbook), then try again." };
  }
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
    const head = new TextDecoder().decode(bytes.subarray(0, 512));
    if (/[,;\t]/.test(head) && !head.includes("\0")) return { ok: false, error: "This looks like a text file such as CSV, not an Excel workbook. Use the JSON ⇄ CSV converter for CSV files." };
    return { ok: false, error: "This isn't an .xlsx workbook. Choose a file saved by Excel, Google Sheets or Numbers as .xlsx." };
  }
  const archive = await unzip(bytes, (name) => /^xl\/|^\[Content_Types\]\.xml$/.test(name));
  if (!archive.ok) return archive;
  const text = (name: string) => {
    const data = archive.files.get(name);
    return data ? new TextDecoder().decode(data) : undefined;
  };
  const workbook = text("xl/workbook.xml");
  if (!workbook) {
    // Other ZIP-based files, such as OpenDocument .ods or Word .docx, have no xl/ folder.
    return { ok: false, error: archive.files.has("[Content_Types].xml") ? "This is an Office file, but not an Excel workbook." : "This isn't an Excel workbook (an OpenDocument .ods file, perhaps). Save it as .xlsx and try again." };
  }

  const notes = new Set<string>();
  const strings = [...(text("xl/sharedStrings.xml") ?? "").matchAll(elements("si"))].map((m) => itemText(m[2] ?? ""));

  // Which cell styles are dates, from each style's number format.
  const styles = text("xl/styles.xml") ?? "";
  const formats = new Map<number, string>();
  for (const m of styles.matchAll(elements("numFmt"))) formats.set(Number(attr(m[0], "numFmtId")), decode(attr(m[0], "formatCode") ?? ""));
  const cellXfs = /<(?:\w+:)?cellXfs\b[\s\S]*?<\/(?:\w+:)?cellXfs>/.exec(styles)?.[0] ?? "";
  const styleDates = [...cellXfs.matchAll(/<(?:\w+:)?xf\b[^>]*>/g)].map((m) => {
    const id = Number(attr(m[0], "numFmtId") ?? 0);
    const custom = formats.get(id);
    return custom !== undefined ? dateFormat(custom) : { date: builtInDates.has(id), time: builtInTimes.has(id) };
  });
  const date1904 = /<(?:\w+:)?workbookPr\b[^>]*\sdate1904="(?:1|true)"/.test(workbook);
  // Day numbers in the 1904 system start four years later; storing them in the 1900 system keeps one conversion.
  const offset = date1904 ? 1462 : 0;

  const rels = text("xl/_rels/workbook.xml.rels") ?? "";
  const targets = new Map<string, { target: string; type: string }>();
  for (const m of rels.matchAll(elements("Relationship"))) targets.set(attr(m[0], "Id") ?? "", { target: attr(m[0], "Target") ?? "", type: attr(m[0], "Type") ?? "" });

  const sheets: WorkbookSheet[] = [];
  for (const m of workbook.matchAll(elements("sheet"))) {
    const name = decode(attr(m[0], "name") ?? `Sheet${sheets.length + 1}`);
    const rel = targets.get(attr(m[0], "r:id") ?? attr(m[0], "id") ?? "");
    if (!rel || !/\/worksheet$/.test(rel.type)) continue;
    const xml = text(resolveTarget(rel.target));
    if (xml === undefined) continue;
    const hidden = /^(hidden|veryHidden)$/.test(attr(m[0], "state") ?? "");
    if (hidden) notes.add("The workbook has hidden sheets; they're listed with the others.");

    const grid = new Map<number, XlsxCell[]>();
    let nextRow = 0;
    for (const row of xml.matchAll(elements("row"))) {
      const r = Number(attr(row[0], "r") ?? nextRow + 1) - 1;
      nextRow = r + 1;
      const cells: XlsxCell[] = [];
      let nextCol = 0;
      const body = row[2] ?? "";
      for (const c of body.matchAll(elements("c"))) {
        const ref = attr(c[0], "r");
        const col = ref ? colIndex(ref) : nextCol;
        nextCol = col + 1;
        const inner = c[2] ?? "";
        const type = attr(c[0], "t") ?? "n";
        const v = /<(?:\w+:)?v>([\s\S]*?)<\/(?:\w+:)?v>/.exec(inner)?.[1];
        if (/<(?:\w+:)?f\b/.test(inner)) notes.add("Formulas were read as the values Excel last calculated for them.");
        let cell: XlsxCell = null;
        if (type === "s") cell = v === undefined ? null : (strings[Number(v)] ?? "");
        else if (type === "inlineStr") cell = itemText(/<(?:\w+:)?is>([\s\S]*?)<\/(?:\w+:)?is>/.exec(inner)?.[1] ?? "");
        else if (type === "str") cell = decode(v ?? "");
        else if (type === "b") cell = v === "1" || v === "true";
        else if (type === "e") {
          cell = decode(v ?? "");
          notes.add(`Some cells hold Excel errors such as ${cell || "#N/A"}; they were kept as text.`);
        } else if (type === "d") cell = decode(v ?? "");
        else if (v !== undefined && v !== "") {
          const n = Number(v);
          const style = styleDates[Number(attr(c[0], "s") ?? 0)];
          cell = style?.date ? { serial: n + offset, time: style.time } : n;
        }
        if (cell !== null) cells[col] = cell;
      }
      if (cells.length) grid.set(r, cells);
    }

    // Empty rows are skipped, and the sheet starts at its first used column.
    const used = [...grid.keys()].sort((a, b) => a - b).map((r) => grid.get(r)!);
    const first = used.reduce((n, r) => Math.min(n, r.findIndex((c) => c !== undefined)), Infinity);
    const rows = used.map((r) => Array.from({ length: r.length - (Number.isFinite(first) ? first : 0) }, (_, i) => r[i + (Number.isFinite(first) ? first : 0)] ?? null));
    sheets.push({ name, hidden, rows });
  }
  if (!sheets.length) return { ok: false, error: "The workbook has no worksheets to read." };
  return { ok: true, book: { sheets, notes: [...notes] } };
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

/** An Excel date (a serial day number in the 1900 system) as ISO 8601: a date, a date and time, or a time of day. */
export function serialToIso(serial: number, time: boolean): string {
  // Excel counts a 29 February 1900 that never happened (day 60), so serials before it are one day early.
  if (Math.floor(serial) === 60) return time ? `1900-02-29T${serialToIso(serial - 60 + 61, true).slice(11)}` : "1900-02-29";
  const days = serial < 60 ? serial + 1 : serial;
  const d = new Date(Math.round((days - 25569) * 86400000));
  const clock = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}${d.getUTCMilliseconds() ? `.${pad(d.getUTCMilliseconds(), 3)}` : ""}`;
  if (time && serial < 1) return clock;
  const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  return time ? `${date}T${clock}` : date;
}

export type ExcelToJson = { value: unknown; json: string; rows: number; columns: number; notes: string[] };

/** Converts one sheet, or every sheet keyed by name, to JSON. */
export function workbookToJson(book: Workbook, options: ExcelToJsonOptions, sheetIndex = 0): ExcelToJson {
  const o = options;
  const notes = new Set(book.notes);
  const value = (cell: XlsxCell): unknown => {
    if (cell !== null && typeof cell === "object") return o.dates === "iso" ? serialToIso(cell.serial, cell.time) : cell.serial;
    if (o.json && typeof cell === "string" && /^[[{]/.test(cell)) {
      try {
        const v = JSON.parse(cell) as unknown;
        if (v !== null && typeof v === "object") return v;
      } catch {
        // Not JSON: it stays text.
      }
    }
    return cell === "" ? null : cell;
  };
  let rows = 0;
  let columns = 0;
  const convert = (sheet: WorkbookSheet): unknown[] => {
    const cells = sheet.rows.map((r) => r.map(value));
    columns = Math.max(columns, sheet.rows.reduce((n, r) => Math.max(n, r.length), 0));
    if (!o.headers || !cells.length) {
      rows += cells.length;
      return cells.map((r) => r.map((c) => (c === null && o.empty === "string" ? "" : c)));
    }
    const [header, ...data] = cells;
    rows += data.length;
    const records = rowsToRecords(header, data.map((r) => r.map((c) => (c === null ? "" : c))), o);
    records.notes.forEach((n) => notes.add(n));
    return records.records;
  };

  let result: unknown;
  if (o.sheets === "all") {
    const all: Record<string, unknown> = {};
    for (const sheet of book.sheets) setKey(all, sheet.name, convert(sheet));
    result = all;
  } else result = convert(book.sheets[Math.min(sheetIndex, book.sheets.length - 1)]);
  return { value: result, json: formatJson(result, o), rows, columns, notes: [...notes] };
}
