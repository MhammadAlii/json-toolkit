import type { GuideMeta } from "../guide";

export const jsonPathCheatSheetGuide: GuideMeta = {
  slug: "jsonpath-cheat-sheet",
  title: "JSONPath Cheat Sheet: Syntax, Filters and Examples (RFC 9535)",
  h1: "JSONPath cheat sheet with examples",
  description:
    "JSONPath syntax on one page: root, child and recursive selectors, wildcards, array slices, filters with comparisons and functions, with a worked example for each.",
  keywords: ["jsonpath", "jsonpath cheat sheet", "jsonpath examples", "jsonpath filter", "jsonpath syntax", "rfc 9535", "jsonpath tester"],
  summary: "Every JSONPath selector and filter you'll need on one page, each with an example and its result, following the RFC 9535 standard.",
  published: "2026-10-17",
  updated: "2026-10-17",
  readingMinutes: 5,
  tools: ["json-query", "json-deep-search", "json-tree-viewer"],
  faqs: [
    {
      q: "Is JSONPath a standard?",
      a: "Yes, since February 2024: RFC 9535 standardised JSONPath. Before that, implementations followed Stefan Goessner's 2007 article and differed in details, especially filters, so older libraries may not support every example here.",
    },
    {
      q: "What's the difference between JSONPath and jq?",
      a: "JSONPath only selects values from a document. jq is a full language that can also transform, compute and reshape JSON. JSONPath is common inside other tools (Kubernetes, API testing, databases); jq is a command-line tool.",
    },
    {
      q: "Do I need ( ) around filter expressions?",
      a: "RFC 9535 writes filters as [?@.price < 10]. The older [?(@.price < 10)] form with parentheses still works in most implementations, including the JSON Toolkit Query tool.",
    },
  ],
};
