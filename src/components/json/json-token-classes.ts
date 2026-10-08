import type { JsonTokenType } from "@/core/json/tokenize";

export const jsonTokenClasses: Record<JsonTokenType, string> = {
  key: "text-json-key",
  string: "text-json-string",
  number: "text-json-number",
  boolean: "text-json-boolean",
  null: "text-json-null",
  punct: "text-json-punct",
  space: "",
};
