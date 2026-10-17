import type { GuideMeta } from "../guide";

export const formatJsonGuide: GuideMeta = {
  slug: "format-json",
  title: "How to Format (Pretty Print) JSON – Online, JavaScript, Python, jq",
  h1: "How to format and pretty print JSON",
  description:
    "Pretty print JSON online, with JSON.stringify in JavaScript, json.dumps and json.tool in Python, jq on the command line and in VS Code, plus how to minify it again.",
  keywords: ["format json", "pretty print json", "json beautify", "json.stringify pretty", "python pretty print json", "jq pretty print", "format json vs code"],
  summary: "Turn a one-line JSON blob into readable, indented JSON online, in code or on the command line, and minify it again when you're done.",
  published: "2026-10-17",
  updated: "2026-10-17",
  readingMinutes: 4,
  tools: ["json-formatter", "json-minifier", "json-validator"],
  faqs: [
    {
      q: "Does formatting change my JSON data?",
      a: "No. Formatting only adds or removes whitespace between values, so the data is identical. Sorting keys changes the order of keys in objects, which doesn't change their meaning.",
    },
    {
      q: "2 spaces or 4 spaces?",
      a: "Either is fine; it's a style choice. 2 spaces is the most common in JavaScript projects and APIs, while Python's json.tool defaults to 4.",
    },
    {
      q: "Why does Python show \\u00eb instead of ë?",
      a: "json.dumps escapes non-ASCII characters by default. Pass ensure_ascii=False (or --no-ensure-ascii to json.tool) to keep them as they are.",
    },
  ],
};
