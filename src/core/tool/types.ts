export type ToolSlug =
  | "json-formatter"
  | "json-validator"
  | "json-repair"
  | "json-minifier"
  | "json-deep-search"
  | "json-tree-viewer"
  | "json-table-viewer"
  | "json-diff"
  | "json-schema-validator"
  | "json-query"
  | "json-to-yaml"
  | "json-to-csv"
  | "json-to-typescript"
  | "json-to-excel"
  | "json-to-xml"
  | "json-to-sql"
  | "json-to-string"
  | "string-to-json"
  | "jwt-decoder"
  | "url-encoder"
  | "base64-converter"
  | "epoch-converter";

export type ToolCategory = "core" | "explore" | "query" | "converters" | "utilities";

export type ToolIcon =
  | "align-left"
  | "question"
  | "wrench"
  | "compress"
  | "folder-tree"
  | "table"
  | "search"
  | "table-columns"
  | "file-shield"
  | "wand"
  | "file-code"
  | "csv"
  | "code"
  | "file-excel"
  | "file-lines"
  | "database"
  | "key"
  | "link"
  | "barcode"
  | "clock"
  | "quote";
export type ToolTint = "purple" | "green" | "amber" | "blue" | "indigo" | "pink";

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
  summary: string;
  icon: ToolIcon;
  tint: ToolTint;
  intro: string;
  steps: string[];
  faqs: Faq[];
  related: ToolSlug[];
  views?: ToolView[];
};
