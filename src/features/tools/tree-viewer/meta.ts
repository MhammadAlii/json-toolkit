import type { ToolMeta } from "@/core/tool/types";

export const treeViewerTool: ToolMeta = {
  slug: "json-tree-viewer",
  name: "Tree Viewer",
  h1: "JSON Tree Viewer",
  title: "JSON Tree Viewer – Explore Nested JSON Online",
  description:
    "View JSON as an interactive, collapsible tree. Expand and collapse nested objects and arrays to explore large API responses. Free and runs in your browser.",
  keywords: ["json tree viewer", "json viewer", "json tree", "view json online", "json explorer"],
  category: "explore",
  tagline: "Browse nested JSON as a collapsible tree",
  summary: "Navigate complex nested structures with an interactive collapsible tree interface.",
  icon: "folder-tree",
  tint: "green",
  intro:
    "Paste JSON and explore it as a tree. Collapse the parts you don't need, see how many keys or items each level holds, and find your way around deeply nested data.",
  steps: ["Paste your JSON or upload a file.", "Expand and collapse objects and arrays.", "Copy the values you need."],
  faqs: [
    {
      q: "Can it handle large files?",
      a: "Yes. Nested levels start collapsed below the second level, so even large documents stay fast to browse.",
    },
    {
      q: "Is my JSON uploaded?",
      a: "No. The tree is built in your browser, so the data never leaves your device.",
    },
  ],
  related: ["json-table-viewer", "json-formatter", "json-deep-search"],
};
