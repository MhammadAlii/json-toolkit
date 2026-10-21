import { sortDeep } from "@/core/json/sort";

/** How a converter that produces JSON lays it out. */
export type JsonOutputOptions = {
  indent: 2 | 4 | "tab" | "minify";
  sortKeys: boolean;
};

export const defaultJsonOutputOptions: JsonOutputOptions = { indent: 2, sortKeys: false };

export function formatJson(value: unknown, options: JsonOutputOptions): string {
  const v = options.sortKeys ? sortDeep(value) : value;
  const indent = options.indent === "minify" ? undefined : options.indent === "tab" ? "\t" : options.indent;
  return JSON.stringify(v, null, indent);
}
