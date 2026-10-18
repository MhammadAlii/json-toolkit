import type { ToolSlug } from "@/core/tool/types";

export type GuideSlug =
  | "fix-json-errors"
  | "format-json"
  | "json-vs-yaml"
  | "json-vs-xml"
  | "json-to-excel"
  | "compare-json"
  | "json-schema-tutorial"
  | "jsonpath-cheat-sheet"
  | "what-is-jwt"
  | "base64-explained"
  | "url-encoding"
  | "unix-timestamp";

export type GuideMeta = {
  slug: GuideSlug;
  /** The <title>, written for search results. */
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  /** One sentence for cards and the lead under the title. */
  summary: string;
  /** ISO dates. */
  published: string;
  updated: string;
  readingMinutes: number;
  /** The tools the guide uses, shown as cards after the article. */
  tools: ToolSlug[];
  faqs: { q: string; a: string }[];
};
