import type { GuideMeta } from "../guide";

export const jsonToExcelGuide: GuideMeta = {
  slug: "json-to-excel",
  title: "How to Convert JSON to Excel (XLSX) or CSV – 4 Ways",
  h1: "How to convert JSON to Excel",
  description:
    "Four ways to open JSON in Excel: an online converter, Excel's Power Query, CSV for Google Sheets, and Python with pandas, plus how nested objects and arrays become columns.",
  keywords: ["json to excel", "convert json to excel", "json to xlsx", "open json in excel", "power query json", "json to csv", "pandas json to excel"],
  summary: "Turn JSON into a spreadsheet with an online converter, Excel's own Power Query, a CSV file or a few lines of Python, and handle nested data properly.",
  published: "2026-10-17",
  updated: "2026-10-17",
  readingMinutes: 5,
  tools: ["json-to-excel", "json-to-csv", "json-table-viewer"],
  faqs: [
    {
      q: "What JSON shape converts best?",
      a: "An array of objects, where each object is one row and its keys are the columns. If your data is an object that contains such an array (for example {\"users\": [...]}), convert that array.",
    },
    {
      q: "Should I use Excel (XLSX) or CSV?",
      a: "XLSX keeps numbers, dates and true/false as real types and opens the same way everywhere. CSV is plain text, works with every tool, but Excel may re-interpret it: it can strip leading zeros, turn long numbers into scientific notation or garble accented characters.",
    },
    {
      q: "Is there a size limit?",
      a: "An Excel sheet holds up to 1,048,576 rows and 16,384 columns, and a cell up to 32,767 characters. Larger data should go to CSV or a database instead.",
    },
  ],
};
