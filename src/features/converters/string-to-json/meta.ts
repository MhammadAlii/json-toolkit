import type { ToolMeta } from "@/core/tool/types";

export const stringToJsonTool: ToolMeta = {
  slug: "string-to-json",
  name: "String to JSON",
  h1: "String to JSON Converter",
  title: "String to JSON – Unescape a JSON String Online",
  description:
    "Turn an escaped JSON string back into formatted JSON. Handles strings stringified once or twice, from logs, APIs and environment variables. Free and private.",
  keywords: ["string to json", "unescape json", "parse json string", "json string to object", "convert string to json"],
  category: "converters",
  tagline: "Unescape a string back into JSON",
  summary: "Convert an escaped JSON string from logs or APIs back into readable JSON.",
  icon: "quote",
  tint: "blue",
  intro:
    'Paste an escaped JSON string, such as "{\\"id\\":1}" from a log or API response, and get clean, formatted JSON back. Double-stringified input is unwrapped automatically.',
  steps: ["Paste the escaped string, with or without the outer quotes.", "Review the formatted JSON.", "Copy or download it."],
  faqs: [
    {
      q: "Why is my JSON full of backslashes?",
      a: "It was stringified, often by a logger or by storing JSON inside another JSON field. String to JSON removes the escaping.",
    },
    {
      q: "Do I need to include the outer quotes?",
      a: "No. Both \"{\\\"a\\\":1}\" and {\\\"a\\\":1} work.",
    },
  ],
  related: ["json-to-string", "json-repair", "json-formatter"],
};
