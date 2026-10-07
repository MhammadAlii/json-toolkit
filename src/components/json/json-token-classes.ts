import type { JsonTokenType } from "@/core/json/tokenize";

export const jsonTokenClasses: Record<JsonTokenType, string> = {
  key: "text-brand",
  string: "text-code-green",
  number: "text-code-literal",
  boolean: "text-code-literal",
  null: "text-muted",
  punct: "text-muted/50",
  space: "",
};
