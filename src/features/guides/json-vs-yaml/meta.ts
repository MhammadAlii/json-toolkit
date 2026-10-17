import type { GuideMeta } from "../guide";

export const jsonVsYamlGuide: GuideMeta = {
  slug: "json-vs-yaml",
  title: "JSON vs YAML: Differences, Pros and Cons, and When to Use Each",
  h1: "JSON vs YAML: differences and when to use each",
  description:
    "A side-by-side comparison of JSON and YAML: syntax, comments, data types, parsing pitfalls like the Norway problem, and which to choose for APIs and config files.",
  keywords: ["json vs yaml", "yaml vs json", "difference between json and yaml", "json or yaml for config", "yaml norway problem", "convert json to yaml"],
  summary: "How JSON and YAML compare on syntax, comments and data types, the YAML pitfalls to watch for, and which one fits APIs and which fits config files.",
  published: "2026-10-17",
  updated: "2026-10-17",
  readingMinutes: 5,
  tools: ["json-to-yaml", "json-formatter", "json-validator"],
  faqs: [
    {
      q: "Is YAML a superset of JSON?",
      a: "Since YAML 1.2, almost any JSON document is also valid YAML, so a YAML 1.2 parser can read it. The reverse isn't true: YAML features such as comments, anchors and unquoted strings aren't valid JSON.",
    },
    {
      q: "Is JSON or YAML faster to parse?",
      a: "JSON. Its grammar is much smaller and stricter, and every language has fast, built-in JSON parsers. That's one reason APIs almost always use JSON.",
    },
    {
      q: "Can I convert between them without losing data?",
      a: "JSON to YAML is lossless. YAML to JSON loses comments and anchors, and any YAML-only types (like dates or custom tags) have to be turned into strings or numbers.",
    },
  ],
};
