import type { GuideMeta } from "../guide";

export const fixJsonErrorsGuide: GuideMeta = {
  slug: "fix-json-errors",
  title: "How to Fix “Unexpected token” and Other JSON Parse Errors",
  h1: "How to fix “Unexpected token” and other JSON errors",
  description:
    "What “Unexpected token”, “Expected double-quoted property name” and “Unexpected end of JSON input” mean, the 8 mistakes that cause them, and how to fix each one.",
  keywords: [
    "unexpected token in json",
    "json parse error",
    "expected double-quoted property name in json",
    "unexpected end of json input",
    "fix invalid json",
    "json syntax error",
  ],
  summary: "What the most common JSON.parse and Python errors mean, the mistakes behind them, and how to fix each one in seconds.",
  published: "2026-10-17",
  updated: "2026-10-17",
  readingMinutes: 6,
  tools: ["json-validator", "json-repair", "json-formatter"],
  faqs: [
    {
      q: "Why does JSON.parse say “Unexpected token <”?",
      a: "The text starts with <, which almost always means a server returned an HTML page (often an error or login page) instead of JSON. Check the request URL, the status code and the response's Content-Type before parsing.",
    },
    {
      q: "Can JSON have comments or trailing commas?",
      a: "No. Standard JSON (RFC 8259) allows neither. Formats such as JSON5 and JSONC accept them, but JSON.parse and most JSON libraries reject them.",
    },
    {
      q: "How do I find which line has the error?",
      a: "Paste the JSON into a validator. It reports the exact line and column of the first error and explains what was expected there.",
    },
  ],
};
