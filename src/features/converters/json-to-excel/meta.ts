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
  icon: "csv",
  tint: "green",
  intro:
    "Turn an array of JSON objects into a real Excel workbook. Nested objects become dot-notation columns, and the file opens directly in Excel, Google Sheets or Numbers.",
  steps: ["Paste a JSON array of objects.", "Preview the columns.", "Download the .xlsx file."],
  faqs: [
    {
      q: "How is this different from JSON to CSV?",
      a: "Excel files keep types such as numbers and booleans and avoid delimiter or encoding issues that CSV files can have when opened in Excel.",
    },
    {
      q: "Are nested objects supported?",
      a: "Yes. Nested objects are flattened into columns like address.city; arrays are written as JSON text.",
    },
  ],
  related: ["json-to-csv", "json-to-sql", "json-formatter"],
};
