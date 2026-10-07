import type { ToolMeta } from "@/core/tool/types";

export const minifierTool: ToolMeta = {
  slug: "json-minifier",
  name: "JSON Minifier",
  h1: "JSON Minifier",
  title: "JSON Minifier – Compress & Minify JSON Online",
  description:
    "Minify JSON by removing whitespace and line breaks to shrink payload size. See how many characters you saved. Free, fast and runs in your browser.",
  keywords: ["json minifier", "minify json", "compress json", "json compressor", "remove whitespace json"],
  category: "core",
  tagline: "Strip whitespace to shrink payloads",
  summary: "Remove whitespace and newlines to compress your JSON payload for production.",
  icon: "compress",
  tint: "purple",
  intro:
    "Strip all unnecessary whitespace from JSON to produce the smallest equivalent output, ideal for APIs, config files and storage.",
  steps: [
    "Paste formatted JSON or upload a file.",
    "The minified output appears instantly along with the size reduction.",
    "Copy or download the minified JSON.",
  ],
  faqs: [
    {
      q: "Does minifying JSON change the data?",
      a: "No. Minification only removes insignificant whitespace between tokens. Whitespace inside string values is preserved.",
    },
    {
      q: "Should I minify JSON for APIs?",
      a: "Minifying helps, but HTTP compression (gzip or Brotli) usually saves far more. For best results, do both.",
    },
  ],
  related: ["json-formatter", "json-validator", "json-diff"],
};
