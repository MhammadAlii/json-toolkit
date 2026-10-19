import type { ToolMeta } from "@/core/tool/types";

export const repairTool: ToolMeta = {
  slug: "json-repair",
  name: "JSON Repair",
  h1: "JSON Repair Tool",
  title: "JSON Repair – Fix Broken & Invalid JSON Online",
  description:
    "Repair broken JSON automatically: trailing commas, single quotes, unquoted keys, comments, missing brackets, code fences, MongoDB output and more. Free, private and runs in your browser.",
  keywords: ["json repair", "fix json", "repair json online", "fix invalid json", "json fixer", "fix json from chatgpt", "mongodb json to valid json"],
  category: "core",
  tagline: "Auto-fix missing quotes or commas",
  summary: "Automatically fix common syntax errors like trailing commas or missing quotes.",
  icon: "wrench",
  tint: "purple",
  intro:
    "Paste malformed JSON, such as output from a log, an LLM or a JavaScript object literal, and get valid JSON back. Common mistakes are fixed automatically and every change is listed.",
  steps: [
    "Paste the broken JSON or upload a file.",
    "Review the audit log: each fix shows its line, what changed, and where it is in the highlighted result.",
    "Copy or download the repaired JSON, or press Repair to replace your input. Untick any repair rule you don't want applied.",
  ],
  faqs: [
    {
      q: "What can JSON Repair fix?",
      a: "Trailing and missing commas, single, smart and backtick quotes, unquoted keys and values, comments, Python-style True/False/None, NaN and undefined, missing brackets, unescaped quotes, line breaks and backslashes inside strings, markdown code fences and text around JSON (as in AI answers), JavaScript assignments, JSONP and MongoDB wrappers like ObjectId() and ISODate().",
    },
    {
      q: "Can it fix JSON copied from ChatGPT or another AI?",
      a: "Yes. It removes the ``` code block and any explanation around the JSON, then fixes the usual mistakes inside it, such as trailing commas or comments.",
    },
    {
      q: "Will repairing change my data?",
      a: "Repair only changes syntax. Review the result, because ambiguous input (such as a truncated file) may need a manual check.",
    },
  ],
  related: ["json-validator", "json-formatter", "json-minifier"],
};
