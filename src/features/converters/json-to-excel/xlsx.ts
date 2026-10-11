import { zip } from "@/core/file/zip";

/** A date cell holds an Excel serial number; `time` picks a date-and-time format over a date-only one. */
export type XlsxCell = null | number | boolean | string | { serial: number; time: boolean };

export type XlsxSheet = { name: string; headers: string[]; rows: XlsxCell[][] };

export type XlsxLayout = { headers: boolean; freezeHeader: boolean; autoFilter: boolean };

// Excel's limits on cell text and sheet size.
export const maxCellText = 32767;
export const maxRows = 1048576;
export const maxColumns = 16384;

const style = { header: 1, date: 2, dateTime: 3 };

// XML 1.0 can't hold most control characters or unpaired surrogates, and Excel rejects files containing them.
const xmlText = (text: string) =>
  text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "�")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function columnLetter(index: number): string {
  let name = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
}

/** Makes names valid and unique as Excel sheet names: at most 31 characters, none of []:*?/\ and not "History". */
export function sheetNames(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((raw) => {
    let base = raw.replace(/[[\]:*?/\\]/g, "_").replace(/^'+|'+$/g, "").trim().slice(0, 31) || "Sheet";
    if (base.toLowerCase() === "history") base = "History_";
    let name = base;
    for (let n = 2; used.has(name.toLowerCase()); n++) name = `${base.slice(0, 31 - String(n).length - 1)}_${n}`;
    used.add(name.toLowerCase());
    return name;
  });
}

const cellText = (cell: XlsxCell) => (cell === null ? "" : typeof cell === "object" ? (cell.time ? "0000-00-00 00:00:00" : "0000-00-00") : String(cell));

function cellXml(cell: XlsxCell, ref: string, header = false): string {
  if (cell === null) return "";
  if (typeof cell === "number") return `<c r="${ref}"><v>${cell}</v></c>`;
  if (typeof cell === "boolean") return `<c r="${ref}" t="b"><v>${cell ? 1 : 0}</v></c>`;
  if (typeof cell === "object") return `<c r="${ref}" s="${cell.time ? style.dateTime : style.date}"><v>${cell.serial}</v></c>`;
  // Inline strings are never evaluated, so text such as "=SUM(A1)" can't run as a formula.
  return `<c r="${ref}" t="inlineStr"${header ? ` s="${style.header}"` : ""}><is><t xml:space="preserve">${xmlText(cell)}</t></is></c>`;
}

function sheetXml(sheet: XlsxSheet, layout: XlsxLayout): string {
  const rows: XlsxCell[][] = layout.headers ? [sheet.headers, ...sheet.rows] : sheet.rows;
  const width = sheet.headers.length;
  const lastRef = `${columnLetter(Math.max(width - 1, 0))}${Math.max(rows.length, 1)}`;
  const freeze = layout.headers && layout.freezeHeader && sheet.rows.length > 0;
  const filter = layout.headers && layout.autoFilter && width > 0;

  // Column widths follow the longest text in the header and the first rows, within sensible bounds.
  const sample = rows.slice(0, 500);
  const cols = sheet.headers
    .map((_, i) => {
      const longest = Math.max(...sample.map((r) => cellText(r[i] ?? null).length), 0);
      return `<col min="${i + 1}" max="${i + 1}" width="${Math.min(Math.max(longest + 2, 8), 60)}" customWidth="1"/>`;
    })
    .join("");

  const data = rows
    .map((row, r) => `<row r="${r + 1}">${row.map((cell, c) => cellXml(cell, `${columnLetter(c)}${r + 1}`, layout.headers && r === 0)).join("")}</row>`)
    .join("");

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    `<dimension ref="A1:${lastRef}"/>` +
    `<sheetViews><sheetView workbookViewId="0">${freeze ? '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' : ""}</sheetView></sheetViews>` +
    '<sheetFormatPr defaultRowHeight="15"/>' +
    (cols ? `<cols>${cols}</cols>` : "") +
    `<sheetData>${data}</sheetData>` +
    (filter ? `<autoFilter ref="A1:${lastRef}"/>` : "") +
    "</worksheet>"
  );
}

const stylesXml =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<numFmts count="2"><numFmt numFmtId="164" formatCode="yyyy-mm-dd"/><numFmt numFmtId="165" formatCode="yyyy-mm-dd hh:mm:ss"/></numFmts>' +
  '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
  '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="4">' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
  '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
  '<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
  "</cellXfs>" +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
  "</styleSheet>";

/** Builds an .xlsx workbook with one worksheet per sheet. Sheet names must already be valid (see `sheetNames`). */
export function buildXlsx(sheets: XlsxSheet[], layout: XlsxLayout): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder();
  const file = (name: string, text: string) => ({ name, data: encoder.encode(text) });
  const xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

  const filters = sheets
    .map((s, i) => {
      if (!layout.headers || !layout.autoFilter || s.headers.length === 0) return "";
      const last = `$${columnLetter(s.headers.length - 1)}$${s.rows.length + 1}`;
      return `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${xmlText(s.name.replace(/'/g, "''"))}'!$A$1:${last}</definedName>`;
    })
    .join("");

  return zip([
    file(
      "[Content_Types].xml",
      `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("") +
        "</Types>",
    ),
    file(
      "_rels/.rels",
      `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        "</Relationships>",
    ),
    file(
      "xl/workbook.xml",
      `${xml}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<sheets>${sheets.map((s, i) => `<sheet name="${xmlText(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>` +
        (filters ? `<definedNames>${filters}</definedNames>` : "") +
        "</workbook>",
    ),
    file(
      "xl/_rels/workbook.xml.rels",
      `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("") +
        `<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        "</Relationships>",
    ),
    file("xl/styles.xml", stylesXml),
    ...sheets.map((s, i) => file(`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s, layout))),
  ]);
}
