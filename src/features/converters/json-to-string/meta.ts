import type { ToolMeta } from "@/core/tool/types";

export const jsonToStringTool: ToolMeta = {
  slug: "json-to-string",
  name: "JSON ⇄ String",
  h1: "JSON to String & String to JSON",
  title: "JSON to String & String to JSON – Escape and Unescape Online",
  description:
    "Escape JSON into a string literal for code, config or another JSON field, or unescape a stringified JSON string back into formatted JSON. Free and private.",
  keywords: [
    "json to string",
    "string to json",
    "stringify json",
    "escape json string",
    "unescape json",
    "parse json string",
    "json stringify online",
  ],
  category: "converters",
  tagline: "Escape and unescape JSON strings",
  summary: "Escape JSON into a string literal, or turn an escaped string from logs or APIs back into JSON.",
  icon: "quote",
  tint: "blue",
  intro:
    "Escape JSON into a single string you can embed in code, environment variables or another JSON field, or swap direction to unescape a string like \"{\\\"id\\\":1}\" back into clean JSON. Strings stringified more than once are unwrapped automatically.",
  steps: [
    "Paste JSON to escape it, or press Swap and paste an escaped string to unescape it.",
    "The result appears as you type; Swap moves it into the input so you can convert it back.",
    "Use Options for the layout, quotes and Unicode escapes (or indentation when unescaping), then copy or download the result.",
  ],
  faqs: [
    {
      q: "What does JSON to String do?",
      a: 'It wraps your JSON in quotes and escapes everything inside, so {"a":1} becomes "{\\"a\\":1}", a valid string you can paste anywhere a string is expected.',
    },
    {
      q: "Why is my JSON full of backslashes?",
      a: "It was stringified, often by a logger or by storing JSON inside another JSON field. Swap to String to JSON to remove the escaping.",
    },
    {
      q: "Do I need to include the outer quotes when unescaping?",
      a: "No. Quoted and unquoted strings both work, as do single-quoted ones and strings stringified twice or more.",
    },
  ],
  related: ["json-minifier", "json-repair", "json-formatter"],
};
