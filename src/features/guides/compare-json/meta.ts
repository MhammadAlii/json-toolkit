import type { GuideMeta } from "../guide";

export const compareJsonGuide: GuideMeta = {
  slug: "compare-json",
  title: "How to Compare Two JSON Files (Online, jq, Python, JavaScript)",
  h1: "How to compare two JSON files",
  description:
    "Why a normal text diff fails on JSON, and how to compare two JSON files properly: online, with jq, in Python and in JavaScript, ignoring key order and formatting.",
  keywords: ["compare json", "json diff", "compare two json files", "json compare online", "diff json jq", "python compare json", "json patch"],
  summary: "Compare JSON by its data rather than its text, so key order and formatting don't show up as changes, online or in code.",
  published: "2026-10-18",
  updated: "2026-10-18",
  readingMinutes: 5,
  tools: ["json-diff", "json-formatter", "json-deep-search"],
  faqs: [
    {
      q: "Does key order matter in JSON?",
      a: "No. JSON objects are unordered, so {\"a\":1,\"b\":2} and {\"b\":2,\"a\":1} contain the same data. Array order does matter: [1,2] and [2,1] are different.",
    },
    {
      q: "What is JSON Patch?",
      a: "A standard format (RFC 6902) for describing changes to a JSON document as a list of operations like add, remove and replace, each with a path. Applying the patch to the first document produces the second.",
    },
    {
      q: "Can I compare very large JSON files?",
      a: "Yes. A structural diff only needs both documents to be valid JSON. In the browser it handles files of several megabytes; for much larger files, jq on the command line is a good option.",
    },
  ],
};
