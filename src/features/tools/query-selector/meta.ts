import type { ToolMeta } from "@/core/tool/types";

export const querySelectorTool: ToolMeta = {
  slug: "json-query",
  name: "JSON Query Selector",
  h1: "JSON Query Selector (JSONPath)",
  title: "JSONPath Tester – Query & Select JSON Online",
  description:
    "Query JSON with JSONPath expressions and see matching values instantly. Test filters, wildcards and recursive selectors. Free online JSONPath tester.",
  keywords: ["jsonpath tester", "json query", "jsonpath online", "query json", "json selector"],
  category: "query",
  tagline: "Select data with JSONPath",
  icon: "code",
  tint: "purple",
  intro:
    "Extract exactly the data you need from JSON using JSONPath. Results update as you type, which makes it easy to build and debug expressions before using them in code.",
  steps: ["Paste your JSON.", "Write a JSONPath expression such as $.store.book[*].author.", "Copy the matching values."],
  faqs: [
    {
      q: "What is JSONPath?",
      a: "JSONPath is a query language for JSON, similar to XPath for XML, standardised as RFC 9535. Expressions start with $ for the root.",
    },
    {
      q: "Are filter expressions supported?",
      a: "Yes, for example $.items[?(@.price < 10)] selects every item cheaper than 10.",
    },
  ],
  related: ["json-deep-search", "json-formatter", "json-diff"],
};
