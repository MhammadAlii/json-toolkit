import { inferSchema } from "@/core/json/infer-schema";
import { locateLines } from "@/core/json/locate";
import { describeParseError, parseJson } from "@/core/json/parse";
import { formatPath, type PathSegment } from "@/core/json/path";
import { SchemaDefinitionError, validateSchema, type SchemaError } from "@/core/json/schema";

export type Violation = SchemaError & { line?: number };

export type SchemaCheck =
  | { status: "invalid-json"; side: "data" | "schema"; error: string }
  | { status: "invalid-schema"; error: string }
  | { status: "passed" }
  | { status: "failed"; violations: Violation[]; truncated: boolean };

export function checkAgainstSchema(dataText: string, schemaText: string): SchemaCheck {
  const data = parseJson(dataText);
  if (!data.ok) return { status: "invalid-json", side: "data", error: describeParseError(data.error) };
  const schema = parseJson(schemaText);
  if (!schema.ok) return { status: "invalid-json", side: "schema", error: describeParseError(schema.error) };
  try {
    const { errors, truncated } = validateSchema(schema.value, data.value);
    if (errors.length === 0) return { status: "passed" };
    const lineOf = locateLines(dataText);
    // A missing or rejected property has no line of its own, so point at the object holding it.
    const line = (path: PathSegment[]) => lineOf(path) ?? lineOf(path.slice(0, -1));
    return { status: "failed", violations: errors.map((e) => ({ ...e, line: line(e.path) })), truncated };
  } catch (err) {
    if (err instanceof SchemaDefinitionError) return { status: "invalid-schema", error: err.message };
    throw err;
  }
}

export const violationPath = (path: PathSegment[]) => (path.length ? formatPath(path, "") : "(root)");

export const sampleData = JSON.stringify(
  { id: 1042, name: "Ada Lovelace", email: "ada@example.com", age: "36", roles: ["admin"], address: { city: "London", postcode: "W1A 1AA" } },
  null,
  2,
);

export const userSchema = JSON.stringify(
  {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "User",
    type: "object",
    required: ["id", "name", "email", "roles"],
    properties: {
      id: { type: "integer", minimum: 1 },
      name: { type: "string", minLength: 1 },
      email: { type: "string", format: "email" },
      age: { type: "number", minimum: 0 },
      roles: { type: "array", minItems: 2, uniqueItems: true, items: { enum: ["admin", "editor", "viewer"] } },
      address: {
        type: "object",
        required: ["city"],
        properties: { city: { type: "string" }, postcode: { type: "string" } },
      },
    },
    additionalProperties: false,
  },
  null,
  2,
);

const productSchema = JSON.stringify(
  {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Product",
    type: "object",
    required: ["sku", "name", "price"],
    properties: {
      sku: { type: "string", pattern: "^[A-Z]{3}-\\d{4}$" },
      name: { type: "string" },
      price: { type: "number", exclusiveMinimum: 0 },
      currency: { enum: ["USD", "EUR", "GBP"] },
      tags: { type: "array", items: { type: "string" } },
    },
  },
  null,
  2,
);

const blankSchema = JSON.stringify({ $schema: "https://json-schema.org/draft/2020-12/schema", type: "object", properties: {}, required: [] }, null, 2);

export type SchemaTemplate = { id: string; label: string; hint: string; build: (dataText: string) => string | null };

export const schemaTemplates: SchemaTemplate[] = [
  {
    id: "infer",
    label: "Infer from Target JSON",
    hint: "A schema matching your data's current shape",
    build: (dataText) => {
      const data = parseJson(dataText);
      return data.ok ? JSON.stringify(inferSchema(data.value), null, 2) : null;
    },
  },
  { id: "user", label: "User profile", hint: "Types, formats, enums and array limits", build: () => userSchema },
  { id: "product", label: "Product", hint: "Patterns, exclusive minimum and enums", build: () => productSchema },
  { id: "blank", label: "Blank (draft 2020-12)", hint: "Start from scratch", build: () => blankSchema },
];
