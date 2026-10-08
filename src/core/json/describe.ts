import { isPlainObject } from "./path";

export type JsonKind = "object" | "array" | "string" | "number" | "boolean" | "null";

export function jsonKind(value: unknown): JsonKind {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (isPlainObject(value)) return "object";
  return typeof value as "string" | "number" | "boolean";
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function describeSize(value: unknown): string {
  switch (jsonKind(value)) {
    case "string":
      return plural((value as string).length, "char");
    case "array":
      return plural((value as unknown[]).length, "item");
    case "object":
      return plural(Object.keys(value as object).length, "key");
    case "number":
      return plural(String(value).length, "digit");
    default:
      return "—";
  }
}
