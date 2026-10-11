import type { ToolMeta } from "@/core/tool/types";

export const jsonToExcelTool: ToolMeta = {
  slug: "json-to-excel",
  name: "JSON to Excel",
  h1: "JSON to Excel Converter",
  title: "JSON to Excel – Convert JSON to XLSX Online",
  description:
    "Convert JSON arrays to an Excel spreadsheet (.xlsx) with headers and flattened nested fields. Free online converter that runs entirely in your browser.",
  keywords: ["json to excel", "json to xlsx", "convert json to excel", "json to spreadsheet"],
  category: "converters",
  tagline: "Download JSON as an .xlsx file",
  summary: "Download JSON arrays as an Excel workbook with flattened columns.",
  icon: "file-excel",
  tint: "blue",
  intro:
    "Turn an array of JSON objects into a real Excel workbook. Nested objects become dot-notation columns, and the file opens directly in Excel, Google Sheets or Numbers.",
  steps: [
    "Paste a JSON array of objects or drop a file into the input.",
    "Preview the sheet as you type; an object holding several arrays can become one sheet per array.",
    "Use Options for the sheet name, header row, filters, dates and nested data, then download the .xlsx file.",
  ],
  faqs: [
    {
      q: "How is this different from JSON to CSV?",
      a: "Excel files keep types such as numbers, booleans and dates and avoid delimiter or encoding issues that CSV files can have when opened in Excel.",
    },
    {
      q: "Can a cell run a formula?",
      a: "No. Text is written as plain text, so a value like =SUM(A1) shows as typed instead of being calculated.",
    },
    {
      q: "Are nested objects supported?",
      a: "Yes. Nested objects are flattened into columns like address.city. Arrays are written as JSON text by default, or joined or split into columns from Options.",
    },
  ],
  related: ["json-to-csv", "json-to-sql", "json-formatter"],
};
