import type { ToolMeta } from "@/core/tool/types";

export const tableViewerTool: ToolMeta = {
  slug: "json-table-viewer",
  name: "Table Viewer",
  h1: "JSON Table Viewer",
  title: "JSON Table Viewer – View JSON Arrays as a Table",
  description:
    "View JSON arrays of objects as a spreadsheet-style table with a column per key. Great for scanning API results and exports. Free and private.",
  keywords: ["json table viewer", "json to table", "view json as table", "json grid viewer", "json table"],
  category: "explore",
  tagline: "See arrays of objects as a table",
  summary: "Flatten arrays of objects into a spreadsheet-style grid for easy data analysis.",
  icon: "table",
  tint: "green",
  intro:
    "Turn an array of JSON objects into a readable table. Every key becomes a column, missing values are marked, and you can scan hundreds of rows at a glance.",
  steps: ["Paste a JSON array of objects.", "Scan rows and columns in the table.", "Export it with JSON to CSV or JSON to Excel."],
  faqs: [
    {
      q: "What if objects have different keys?",
      a: "Every key from every object becomes a column. Cells for missing keys are shown as empty.",
    },
    {
      q: "Can I view a single object?",
      a: "Yes. A single object is shown as a two-column table of keys and values.",
    },
  ],
  related: ["json-tree-viewer", "json-to-csv", "json-to-excel"],
};
