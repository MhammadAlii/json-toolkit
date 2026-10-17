import type { ToolSlug } from "@/core/tool/types";

// The tools shown on the home page, each with a description written for this page rather than repeated from its own.
export const popularTools: { slug: ToolSlug; description: string }[] = [
  {
    slug: "json-validator",
    description:
      "Find out why JSON won't parse. It points to the exact line and column of the first error and explains what was expected there, in plain words.",
  },
  {
    slug: "json-repair",
    description:
      "Fix JSON copied from code, logs or AI output: trailing commas, single quotes, unquoted keys, comments and missing brackets, with every change listed.",
  },
  {
    slug: "json-diff",
    description:
      "Compare two JSON documents and see exactly what was added, removed or changed. Key order and whitespace never show up as false differences.",
  },
  {
    slug: "json-to-csv",
    description: "Turn an API response into a spreadsheet. Nested objects become columns and the result opens cleanly in Excel or Google Sheets.",
  },
  {
    slug: "json-to-typescript",
    description: "Paste a sample response and get TypeScript interfaces for it, with nested types named for you and optional fields detected.",
  },
  {
    slug: "jwt-decoder",
    description: "See what's inside a JSON Web Token: its claims, when it expires and whether the signature is valid, without the token leaving your browser.",
  },
];
