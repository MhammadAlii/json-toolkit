import type { ToolMeta } from "@/core/tool/types";

export const jsonToExcelTool: ToolMeta = {
  slug: "json-to-excel",
  name: "JSON ⇄ Excel",
  h1: "JSON to Excel & Excel to JSON Converter",
  title: "JSON to Excel & Excel to JSON – Convert JSON and XLSX Online",
  description:
    "Convert JSON arrays to an Excel spreadsheet (.xlsx) with flattened nested fields, or read an .xlsx workbook back into JSON with every sheet, date and number intact. Free and private.",
  keywords: ["json to excel", "excel to json", "json to xlsx", "xlsx to json", "convert json to excel", "convert excel to json", "json to spreadsheet"],
  category: "converters",
  tagline: "Convert JSON to .xlsx and Excel to JSON",
  summary: "Download JSON arrays as an Excel workbook, or turn an .xlsx file back into JSON.",
  icon: "file-excel",
  tint: "blue",
  intro:
    "Turn an array of JSON objects into a real Excel workbook, or swap direction and drop an .xlsx file to read it as JSON. Nested objects become dot-notation columns, and those columns become nested objects again on the way back. Workbooks are read in your browser and never uploaded.",
  steps: [
    "Paste a JSON array of objects to build a workbook, or press Swap and drop or choose an .xlsx file to read it as JSON.",
    "Preview the sheet as you type, or pick which sheet to convert; Swap moves the result across so you can convert it back.",
    "Use Options for the sheet name, header row, filters, dates and nested data (or, for Excel to JSON, sheets, dates and headers), then download the file.",
  ],
  faqs: [
    {
      q: "How is this different from JSON to CSV?",
      a: "Excel files keep types such as numbers, booleans and dates and avoid delimiter or encoding issues that CSV files can have when opened in Excel.",
    },
    {
      q: "Can a cell run a formula?",
      a: "No. Text is written as plain text, so a value like =SUM(A1) shows as typed instead of being calculated. When reading a workbook, formulas give the value Excel last calculated.",
    },
    {
      q: "Are nested objects supported?",
      a: "Yes. Nested objects are flattened into columns like address.city. Arrays are written as JSON text by default, or joined or split into columns from Options. Excel to JSON turns those columns and JSON cells back into nested objects and arrays.",
    },
    {
      q: "Which spreadsheet files can be read?",
      a: "Excel workbooks in the .xlsx format, including files exported from Google Sheets and Numbers. Every sheet can be converted on its own or together, keyed by sheet name, and dates become ISO 8601 text. Older .xls files need to be saved as .xlsx first.",
    },
  ],
  related: ["json-to-csv", "json-to-sql", "json-formatter"],
};
