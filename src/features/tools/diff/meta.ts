import type { ToolMeta } from "@/core/tool/types";

export const diffTool: ToolMeta = {
  slug: "json-diff",
  name: "JSON Diff",
  h1: "JSON Diff – Compare JSON",
  title: "JSON Diff – Compare Two JSON Files Online",
  description:
    "Compare two JSON documents and see every added, removed and changed value with its path. Ignores key order and formatting. Free and runs in your browser.",
  keywords: ["json diff", "compare json", "json compare online", "json difference", "diff json files"],
  category: "query",
  tagline: "Compare two JSON documents",
  summary: "Side-by-side comparison to find differences between two JSON objects.",
  icon: "table-columns",
  tint: "amber",
  intro:
    "Paste two JSON documents to see exactly what changed. Differences are computed structurally, so key order and whitespace never show up as false changes.",
  steps: ["Paste the original JSON on the left.", "Paste the changed JSON on the right.", "Review added, removed and changed paths."],
  faqs: [
    {
      q: "Does key order matter?",
      a: "No. Objects are compared by key, so reordered keys are not reported as differences. Array order does matter.",
    },
    {
      q: "Can I compare large files?",
      a: "Yes. Everything runs locally, so the limit is your browser's memory rather than an upload size.",
    },
  ],
  related: ["json-formatter", "json-deep-search", "json-validator"],
};
