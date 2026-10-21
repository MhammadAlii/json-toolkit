import type { ToolMeta } from "@/core/tool/types";

export const jsonToTypeScriptTool: ToolMeta = {
  slug: "json-to-typescript",
  name: "JSON ⇄ TypeScript",
  h1: "JSON to TypeScript & TypeScript to JSON",
  title: "JSON to TypeScript & TypeScript to JSON – Interfaces and Sample Data",
  description:
    "Generate TypeScript interfaces from JSON, or generate sample JSON from TypeScript interfaces, types and enums for mocks, fixtures and API examples. Free and runs in your browser.",
  keywords: ["json to typescript", "typescript to json", "json to ts", "ts to json", "json to interface", "interface to json", "typescript interface generator", "mock data from typescript", "json2ts"],
  category: "converters",
  tagline: "Generate interfaces, or sample JSON from them",
  summary: "Generate TypeScript interfaces from a JSON sample, or sample JSON from TypeScript types.",
  icon: "code",
  tint: "blue",
  intro:
    "Paste a sample API response and get ready-to-use TypeScript interfaces, or swap direction to turn interfaces, type aliases and enums into realistic sample JSON. Nested objects become their own interfaces, and keys missing from some array items are marked optional.",
  steps: [
    "Paste a JSON sample to generate types, or press Swap and paste TypeScript types to generate sample JSON.",
    "The result appears as you type; for TypeScript to JSON, pick which type to generate when there are several. Swap moves the result into the input so you can convert it back.",
    "Use Options for the root type name, interface or type, array style, null handling and more (or, for TypeScript to JSON, the kind of values, optional fields and array length), then copy or download the file.",
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
    {
      q: "What does TypeScript to JSON generate?",
      a: "A sample value for the chosen type: realistic values picked from property names (an email for email, a date for createdAt, a price for price), or plain placeholders. Values in @example, @default or e.g. comments are used as they are, so types made with JSON to TypeScript and Example comments give back the original values. Unions use their first member, literal types and enums their first value, and recursive types stop after one level.",
    },
    {
      q: "Which TypeScript syntax is supported?",
      a: "Interfaces with extends and generics, type aliases, enums, unions, intersections, arrays, tuples, literal and template types, index signatures, mapped and indexed access types, and utility types such as Partial, Pick, Omit and Record. Functions and methods are left out because JSON can't hold them.",
    },
  ],
  related: ["json-schema-validator", "json-to-yaml", "json-formatter"],
};
