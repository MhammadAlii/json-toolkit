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
  summary: "Query JSON with JSONPath, then filter, select, sort, limit and group the results.",
  icon: "wand",
  tint: "amber",
  intro:
    "Extract exactly the data you need from JSON. Start with a JSONPath expression, then chain SQL-style stages such as WHERE, SELECT, SORT, LIMIT and GROUP. Results update as you type, which makes it easy to build and debug queries before using them in code.",
  steps: [
    "Paste or import your JSON.",
    "Add a PATH stage such as $.users[*] to pick the values to work with.",
    "Chain WHERE, SELECT, SORT, LIMIT or GROUP stages to shape the result.",
    "Copy or export the result, or explore it as a table or tree.",
  ],
  faqs: [
    {
      q: "What is JSONPath?",
      a: "JSONPath is a query language for JSON, similar to XPath for XML, standardised as RFC 9535. Expressions start with $ for the root.",
    },
    {
      q: "Are filter expressions supported?",
      a: "Yes, for example $.items[?(@.price < 10)] selects every item cheaper than 10. Filters support ==, !=, <, <=, >, >=, &&, ||, ! and the RFC 9535 functions length(), count(), match(), search() and value().",
    },
    {
      q: "How do WHERE and SELECT work?",
      a: "WHERE keeps items matching a condition such as age > 18 and profile.active, where field names refer to the current item. SELECT keeps only the listed fields, for example id, profile.name as name.",
    },
  ],
  related: ["json-deep-search", "json-formatter", "json-diff"],
};
