import type { ToolMeta } from "@/core/tool/types";

export const formatterTool: ToolMeta = {
  slug: "json-formatter",
  name: "JSON Formatter",
  h1: "JSON Formatter & Beautifier",
  title: "JSON Formatter & Beautifier Online – Pretty Print JSON",
  description:
    "Format and pretty print JSON online with 2-space, 4-space or tab indentation and optional key sorting. Free, instant and private: runs in your browser.",
  keywords: ["json formatter", "json beautifier", "pretty print json", "format json online", "json pretty"],
  category: "core",
  tagline: "Prettify and clean up JSON code",
  summary: "Clean up messy JSON code with custom indentation and styling options.",
  icon: "align-left",
  tint: "purple",
  intro:
    "Paste minified or messy JSON and get clean, readable, consistently indented output. Errors are reported with the exact line and column so you can fix broken JSON quickly.",
  steps: [
    "Paste your JSON into the input box, upload a .json file, or load the sample.",
    "Pick an indentation (2 spaces, 4 spaces or tabs) and optionally sort keys alphabetically.",
    "Copy the formatted result or download it as a .json file.",
  ],
  faqs: [
    {
      q: "Is my JSON uploaded to a server?",
      a: "No. Formatting happens entirely in your browser with JavaScript. Your data never leaves your device.",
    },
    {
      q: "What is the difference between a JSON formatter and a JSON validator?",
      a: "A formatter re-indents valid JSON to make it readable. A validator checks whether the text is valid JSON and pinpoints errors. This formatter validates as it formats, so invalid input shows the error location.",
    },
    {
      q: "Does sorting keys change my data?",
      a: "Sorting only changes the order of object keys. JSON objects are unordered by specification, so the data is equivalent. Array order is never changed.",
    },
  ],
  views: [
    { id: "code", label: "Code" },
    { id: "tree", label: "Tree" },
    { id: "table", label: "Table" },
  ],
  related: ["json-validator", "json-repair", "json-minifier"],
};
