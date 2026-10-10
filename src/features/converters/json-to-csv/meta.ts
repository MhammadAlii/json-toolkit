import type { ToolMeta } from "@/core/tool/types";

export const jsonToCsvTool: ToolMeta = {
  slug: "json-to-csv",
  name: "JSON to CSV",
  h1: "JSON to CSV Converter",
  title: "JSON to CSV Converter – Convert JSON Array to CSV Online",
  description:
    "Convert a JSON array to CSV online. Nested objects are flattened into dot-notation columns. Choose comma, semicolon or tab. Free and private.",
  keywords: ["json to csv", "convert json to csv", "json to excel", "json array to csv", "json to csv converter"],
  category: "converters",
  tagline: "Export data for spreadsheet apps",
  summary: "Turn arrays of JSON objects into CSV for Excel, Google Sheets or Numbers.",
  icon: "csv",
  tint: "blue",
  intro:
    "Turn an array of JSON objects into a CSV table you can open in Excel, Google Sheets or Numbers. Nested objects become dot-notation columns such as address.city.",
  steps: [
    "Paste a JSON array of objects, or an object holding one, and pick the array if asked.",
    "The CSV appears as you type; switch to Preview to check it as a table, and use Options for the delimiter, quoting, arrays and nulls.",
    "Copy the CSV or download it, with a BOM for Excel if you need one.",
  ],
  faqs: [
    {
      q: "How are nested objects handled?",
      a: "Nested objects are flattened into columns using dot notation, for example { \"user\": { \"name\": \"Ada\" } } becomes a user.name column. Arrays are written as JSON text inside the cell.",
    },
    {
      q: "What if objects have different keys?",
      a: "The converter collects every key from every object to build the header row. Missing values are left empty.",
    },
    {
      q: "Why does Excel put everything in one column?",
      a: "Some regional Excel settings expect semicolons. Switch the delimiter to semicolon and download again.",
    },
  ],
  related: ["json-to-excel", "json-to-sql", "json-formatter"],
};
