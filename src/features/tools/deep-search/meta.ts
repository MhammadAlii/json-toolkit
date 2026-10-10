import type { ToolMeta } from "@/core/tool/types";

export const deepSearchTool: ToolMeta = {
  slug: "json-deep-search",
  name: "JSON Deep Search",
  h1: "JSON Deep Search",
  title: "JSON Search – Find Keys & Values in Nested JSON Online",
  description:
    "Search deeply nested JSON for any key or value and get the exact path to every match. Supports case-insensitive and exact matching. Free and private.",
  keywords: ["json search", "search json", "find in json", "json key finder", "json path finder"],
  category: "explore",
  tagline: "Find any key or value at any depth",
  summary: "Find specific keys or values across massive datasets using regex or exact match.",
  icon: "search",
  tint: "green",
  intro:
    "Find every occurrence of a key or value in large, deeply nested JSON. Each match shows its full path, so you can jump straight to it or reuse it in code.",
  steps: [
    "Paste your JSON or drop a file into the editor.",
    "Type the key, value or path you're looking for; results appear as you type.",
    "Jump between matches with n / p, expand a match's context, and copy its path or value or export every match as CSV.",
  ],
  faqs: [
    {
      q: "Does it search keys and values?",
      a: "Yes. You can search keys, values, full paths or all of them, with optional case sensitivity, exact matching and regular expressions.",
    },
    {
      q: "Can I narrow the search?",
      a: "Yes. Filters limit matches to one value type, such as strings or numbers, a maximum depth, or a maximum number of results.",
    },
    {
      q: "What path format is used?",
      a: "Paths use JavaScript-style notation, for example $.users[0].address.city, which also works as a JSONPath expression.",
    },
  ],
  related: ["json-query", "json-formatter", "json-diff"],
};
