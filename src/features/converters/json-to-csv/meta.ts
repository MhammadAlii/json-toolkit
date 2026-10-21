import type { ToolMeta } from "@/core/tool/types";

export const jsonToCsvTool: ToolMeta = {
  slug: "json-to-csv",
  name: "JSON ⇄ CSV",
  h1: "JSON to CSV & CSV to JSON Converter",
  title: "JSON to CSV & CSV to JSON Converter Online – Free & Instant",
  description:
    "Convert a JSON array to CSV with nested objects flattened into columns, or CSV back to JSON with typed values and nested objects. Comma, semicolon or tab. Free and private.",
  keywords: ["json to csv", "csv to json", "convert json to csv", "convert csv to json", "json array to csv", "csv to json array", "json to csv converter"],
  category: "converters",
  tagline: "Convert JSON to CSV and CSV to JSON",
  summary: "Turn arrays of JSON objects into CSV for spreadsheets, or CSV exports back into JSON.",
  icon: "csv",
  tint: "blue",
  intro:
    "Turn an array of JSON objects into a CSV table you can open in Excel, Google Sheets or Numbers, or swap direction to turn a CSV export into JSON. Nested objects become dot-notation columns such as address.city, and those columns become nested objects again on the way back.",
  steps: [
    "Paste a JSON array of objects to convert it to CSV, or press Swap and paste CSV with a header row to convert it to JSON.",
    "The result appears as you type; for CSV, switch to Preview to check it as a table. Swap moves the result into the input so you can convert it back.",
    "Use Options for the delimiter, quoting, arrays and nulls (or, for CSV to JSON, headers, value types and nesting), then copy or download the file.",
  ],
  faqs: [
    {
      q: "How are nested objects handled?",
      a: "Nested objects are flattened into columns using dot notation, for example { \"user\": { \"name\": \"Ada\" } } becomes a user.name column. Arrays are written as JSON text inside the cell. CSV to JSON reverses both: dotted columns become nested objects, columns like tags.0 and tags.1 become an array, and JSON in a cell becomes JSON again.",
    },
    {
      q: "What if objects have different keys?",
      a: "The converter collects every key from every object to build the header row. Missing values are left empty.",
    },
    {
      q: "Why does Excel put everything in one column?",
      a: "Some regional Excel settings expect semicolons. Switch the delimiter to semicolon and download again.",
    },
    {
      q: "Does CSV to JSON keep numbers as numbers?",
      a: "Cells become numbers or booleans only when they read back unchanged, so 42 and true are converted while 007, 1.0 and long IDs stay text. CSV itself has no types, so turn off Detect numbers under Options to keep every cell as a string. The delimiter is detected automatically.",
    },
  ],
  related: ["json-to-excel", "json-to-sql", "json-formatter"],
};
