export type ToolSlug =
  | "json-formatter"
  | "json-validator"
  | "json-repair"
  | "json-minifier"
  | "json-deep-search"
  | "json-diff"
  | "json-schema-validator"
  | "json-query"
  | "json-to-yaml"
  | "json-to-csv"
  | "json-to-typescript"
  | "json-to-excel"
  | "json-to-xml"
  | "json-to-sql";

export type ToolCategory = "core" | "query" | "converters";

export type ToolIcon = "wand" | "check" | "wrench" | "csv" | "code";
export type ToolTint = "purple" | "green" | "amber" | "blue" | "indigo";

export type Faq = { q: string; a: string };

export type ToolView = { id: string; label: string };

export type ToolMeta = {
  slug: ToolSlug;
  name: string;
  h1: string;
  title: string;
  description: string;
  keywords: string[];
  category: ToolCategory;
  tagline: string;
  icon?: ToolIcon;
  tint: ToolTint;
  intro: string;
  steps: string[];
  faqs: Faq[];
  related: ToolSlug[];
  views?: ToolView[];
};
