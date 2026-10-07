import { jsonTokenClasses } from "./json-token-classes";

export function JsonPrimitive({ value }: { value: unknown }) {
  if (value === null) return <span className={jsonTokenClasses.null}>null</span>;
  if (typeof value === "string") return <span className={jsonTokenClasses.string}>{JSON.stringify(value)}</span>;
  if (typeof value === "number") return <span className={jsonTokenClasses.number}>{String(value)}</span>;
  if (typeof value === "boolean") return <span className={jsonTokenClasses.boolean}>{String(value)}</span>;
  return <span className={jsonTokenClasses.punct}>{JSON.stringify(value)}</span>;
}
