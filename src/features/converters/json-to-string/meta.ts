import type { ToolMeta } from "@/core/tool/types";

export const jsonToStringTool: ToolMeta = {
  slug: "json-to-string",
  name: "JSON to String",
  h1: "JSON to String Converter",
  title: "JSON to String – Escape JSON as a String Literal Online",
  description:
    "Convert JSON into an escaped string you can embed in code, config or another JSON field. Quotes, backslashes and newlines are escaped for you. Free and private.",
  keywords: ["json to string", "stringify json", "escape json string", "json stringify online", "json to escaped string"],
  category: "converters",
  tagline: "Escape JSON into a string literal",
  summary: "Turn JSON into an escaped string ready to embed in code or another JSON field.",
  icon: "quote",
  tint: "blue",
  intro:
    "Paste JSON and get it back as a single escaped string, the same result as JSON.stringify applied twice. Useful for embedding JSON inside other JSON, environment variables or source code.",
  steps: ["Paste your JSON.", "Choose whether to minify it first.", "Copy the escaped string."],
  faqs: [
    {
      q: "What does JSON to String do?",
      a: 'It wraps your JSON in quotes and escapes everything inside, so {"a":1} becomes "{\\"a\\":1}", a valid string you can paste anywhere a string is expected.',
    },
    {
      q: "How do I turn it back into JSON?",
      a: "Use String to JSON, which reverses the process and formats the result.",
    },
  ],
  related: ["string-to-json", "json-minifier", "json-formatter"],
};
