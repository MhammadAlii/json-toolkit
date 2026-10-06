import type { ToolMeta } from "@/core/tool/types";

export const jsonToTypeScriptTool: ToolMeta = {
  slug: "json-to-typescript",
  name: "JSON to TypeScript",
  h1: "JSON to TypeScript Interface Generator",
  title: "JSON to TypeScript – Generate Interfaces from JSON",
  description:
    "Generate TypeScript interfaces from JSON instantly. Handles nested objects, arrays and optional fields. Free online tool that runs in your browser.",
  keywords: ["json to typescript", "json to ts", "json to interface", "typescript interface generator", "json2ts"],
  category: "converters",
  tagline: "Generate interface definitions",
  icon: "code",
  tint: "indigo",
  intro:
    "Paste a sample API response and get ready-to-use TypeScript interfaces. Nested objects become their own interfaces, and keys missing from some array items are marked optional.",
  steps: [
    "Paste a representative JSON sample.",
    "Set the root interface name.",
    "Copy the generated interfaces into your project.",
  ],
  faqs: [
    {
      q: "How are optional properties detected?",
      a: "When an array contains several objects, any key that is missing from at least one object is marked optional with ?.",
    },
    {
      q: "Are the types guaranteed to be complete?",
      a: "Types are inferred from the sample you provide. Use a sample that includes every field and variant you expect, and review nullable fields by hand.",
    },
  ],
  related: ["json-schema-validator", "json-to-yaml", "json-formatter"],
};
