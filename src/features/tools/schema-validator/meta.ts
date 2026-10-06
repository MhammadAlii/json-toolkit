import type { ToolMeta } from "@/core/tool/types";

export const schemaValidatorTool: ToolMeta = {
  slug: "json-schema-validator",
  name: "JSON Schema Validator",
  h1: "JSON Schema Validator",
  title: "JSON Schema Validator – Validate JSON Against a Schema",
  description:
    "Validate JSON data against a JSON Schema (draft 2020-12, 2019-09, 07) and see every error with its path. Free online JSON Schema validator, private by design.",
  keywords: ["json schema validator", "validate json schema", "json schema online", "json schema checker"],
  category: "query",
  tagline: "Validate data against a JSON Schema",
  icon: "check",
  tint: "green",
  intro:
    "Check that JSON data matches a JSON Schema. Every violation is listed with the failing path and the rule that was broken, so you can fix payloads or schemas quickly.",
  steps: ["Paste your JSON Schema.", "Paste the JSON data to validate.", "Fix any listed errors."],
  faqs: [
    {
      q: "Which JSON Schema drafts are supported?",
      a: "Draft 2020-12, 2019-09 and draft-07, which cover the vast majority of schemas in use today.",
    },
    {
      q: "How is this different from the JSON Validator?",
      a: "The JSON Validator checks syntax only. The Schema Validator checks that valid JSON also has the right structure, types and values.",
    },
  ],
  related: ["json-validator", "json-to-typescript", "json-formatter"],
};
