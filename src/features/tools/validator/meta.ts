import type { ToolMeta } from "@/core/tool/types";

export const validatorTool: ToolMeta = {
  slug: "json-validator",
  name: "JSON Validator",
  h1: "JSON Validator",
  title: "JSON Validator – Check & Lint JSON Online with Error Lines",
  description:
    "Validate JSON online and find syntax errors with exact line and column numbers. Free JSON linter that runs in your browser, so no data is uploaded.",
  keywords: ["json validator", "validate json", "json lint", "json checker", "json syntax checker"],
  category: "core",
  tagline: "Check for syntax errors",
  icon: "check",
  tint: "green",
  intro:
    "Check whether your JSON is valid according to the JSON specification (RFC 8259). If it isn't, you'll see the line and column where parsing failed.",
  steps: [
    "Paste the JSON you want to check, or upload a file.",
    "The validator checks it instantly as you type.",
    "Fix any reported error at the given line and column, then re-check.",
  ],
  faqs: [
    {
      q: "What are the most common JSON errors?",
      a: "Trailing commas after the last item, single quotes instead of double quotes, unquoted keys, comments, and unescaped control characters inside strings. None of these are allowed in standard JSON.",
    },
    {
      q: "Can JSON contain comments?",
      a: "No. Standard JSON does not support comments. Formats like JSON5 or JSONC allow them, but a strict JSON parser will reject them.",
    },
    {
      q: "Is a single number or string valid JSON?",
      a: "Yes. Since RFC 7159, any JSON value (including a bare string, number, true, false or null) is valid at the top level.",
    },
  ],
  related: ["json-repair", "json-formatter", "json-schema-validator"],
};
