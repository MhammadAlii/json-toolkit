import type { ToolMeta } from "@/core/tool/types";

export const repairTool: ToolMeta = {
  slug: "json-repair",
  name: "JSON Repair",
  h1: "JSON Repair Tool",
  title: "JSON Repair – Fix Broken & Invalid JSON Online",
  description:
    "Repair broken JSON automatically: fix trailing commas, single quotes, unquoted keys, comments and missing brackets. Free, private and runs in your browser.",
  keywords: ["json repair", "fix json", "repair json online", "fix invalid json", "json fixer"],
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
      a: "Trailing commas, single-quoted strings, unquoted keys, comments, Python-style True/False/None, missing closing brackets and unescaped newlines in strings.",
    },
    {
      q: "Will repairing change my data?",
      a: "Repair only changes syntax. Review the result, because ambiguous input (such as a truncated file) may need a manual check.",
    },
  ],
  related: ["json-validator", "json-formatter", "json-minifier"],
};
