import { isPlainObject } from "@/core/json/path";
import { JsonPrimitive } from "./json-primitive";
import { jsonTokenClasses } from "./json-token-classes";

function Label({ name }: { name?: string | number }) {
  if (name === undefined) return null;
  return (
    <>
      <span className={typeof name === "number" ? "text-muted" : jsonTokenClasses.key}>{typeof name === "number" ? name : JSON.stringify(name)}</span>
      <span className={jsonTokenClasses.punct}>: </span>
    </>
  );
}

export function JsonTreeNode({ name, value, depth = 0 }: { name?: string | number; value: unknown; depth?: number }) {
  const isArray = Array.isArray(value);
  if (!isArray && !isPlainObject(value)) {
    return (
      <div className="py-0.5 pl-5">
        <Label name={name} />
        <JsonPrimitive value={value} />
      </div>
    );
  }

  const entries: [string | number, unknown][] = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);
  const [open, close] = isArray ? ["[", "]"] : ["{", "}"];
  const summary = `${entries.length} ${isArray ? (entries.length === 1 ? "item" : "items") : entries.length === 1 ? "key" : "keys"}`;

  return (
    <details open={depth < 2} className="group">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded py-0.5 hover:bg-border/30 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="inline-block w-4 text-center text-muted transition-transform group-open:rotate-90">
          ▸
        </span>
        <Label name={name} />
        <span className={jsonTokenClasses.punct}>{open}</span>
        <span className="text-xs text-muted/60 group-open:hidden">
          {summary} <span className={jsonTokenClasses.punct}>{close}</span>
        </span>
      </summary>
      <div className="ml-2 border-l border-border/60 pl-2">
        {entries.map(([k, v]) => (
          <JsonTreeNode key={k} name={k} value={v} depth={depth + 1} />
        ))}
      </div>
      <div className={`pl-5 ${jsonTokenClasses.punct}`}>{close}</div>
    </details>
  );
}
