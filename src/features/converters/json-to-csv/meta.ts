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
    "Paste a JSON array of objects (a single object also works).",
    "Choose a delimiter: comma, semicolon (common in European Excel) or tab.",
    "Download the .csv file or copy it into a spreadsheet.",
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
