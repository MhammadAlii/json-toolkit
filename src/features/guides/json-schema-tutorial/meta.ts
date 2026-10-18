import type { GuideMeta } from "../guide";

export const jsonSchemaTutorialGuide: GuideMeta = {
  slug: "json-schema-tutorial",
  title: "JSON Schema Tutorial: Validate JSON Data, With Examples",
  h1: "JSON Schema tutorial: validate JSON with examples",
  description:
    "Learn JSON Schema step by step: types, properties, required fields, enums, formats and arrays, then validate data online, with Ajv in JavaScript or jsonschema in Python.",
  keywords: ["json schema", "json schema tutorial", "json schema example", "validate json schema", "json schema required", "ajv json schema", "python jsonschema"],
  summary: "Write a JSON Schema for real data, understand the keywords you'll use most, and validate JSON against it online, in JavaScript or in Python.",
  published: "2026-10-18",
  updated: "2026-10-18",
  readingMinutes: 6,
  tools: ["json-schema-validator", "json-validator", "json-to-typescript"],
  faqs: [
    {
      q: "Which JSON Schema version should I use?",
      a: "Use draft 2020-12, the current version, for new schemas, and declare it with \"$schema\": \"https://json-schema.org/draft/2020-12/schema\". Draft-07 is still common in older tools and is very similar for everyday schemas.",
    },
    {
      q: "Can I generate a schema from example JSON?",
      a: "Yes. The JSON Schema Validator can infer a starting schema from your data. Review it afterwards: an example can't tell which fields are optional or which values are allowed.",
    },
    {
      q: "Is a valid schema the same as valid JSON?",
      a: "No. Valid JSON only means the syntax is correct. Schema validation checks that the data has the right shape: the expected fields, types and values.",
    },
  ],
};
