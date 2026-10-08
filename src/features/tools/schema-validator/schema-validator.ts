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
  { id: "blank", label: "Blank (draft 2020-12)", hint: "Start from scratch", build: () => blankSchema },
];
