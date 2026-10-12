import { isPlainObject } from "@/core/json/path";

type JsonSchema = Record<string, unknown>;

function typeName(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "number";
  return typeof v;
}

// Combines the schemas of several samples (e.g. array items) into one that accepts them all.
function mergeSchemas(schemas: JsonSchema[]): JsonSchema {
  if (schemas.length === 0) return {};
  // A schema merged earlier may already list several types; flatten them so the list never nests.
  const types = [...new Set(schemas.flatMap((s) => (Array.isArray(s.type) ? (s.type as string[]) : [s.type as string])))];
  const merged = types.includes("number") ? types.filter((t) => t !== "integer") : types;
  if (merged.length > 1) return { type: merged };
  if (merged[0] === "object") {
    const properties: Record<string, JsonSchema[]> = {};
    for (const s of schemas) for (const [k, p] of Object.entries(s.properties as Record<string, JsonSchema>)) (properties[k] ??= []).push(p);
    const required = Object.keys(properties).filter((k) => schemas.every((s) => (s.required as string[]).includes(k)));
    return { type: "object", properties: Object.fromEntries(Object.entries(properties).map(([k, ps]) => [k, mergeSchemas(ps)])), required };
  }
  if (merged[0] === "array") return { type: "array", items: mergeSchemas(schemas.map((s) => s.items as JsonSchema).filter((i) => Object.keys(i).length)) };
  return { type: merged[0] };
}

function infer(v: unknown): JsonSchema {
  if (Array.isArray(v)) return { type: "array", items: mergeSchemas(v.map(infer)) };
  if (isPlainObject(v)) {
    return { type: "object", properties: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, infer(x)])), required: Object.keys(v) };
  }
  return { type: typeName(v) };
}

/** A draft 2020-12 schema that the sample satisfies, with every seen property required. */
export function inferSchema(sample: unknown): JsonSchema {
  return { $schema: "https://json-schema.org/draft/2020-12/schema", ...infer(sample) };
}
