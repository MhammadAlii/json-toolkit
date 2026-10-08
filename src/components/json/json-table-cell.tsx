import { isPlainObject } from "@/core/json/path";
import { JsonPrimitive } from "./json-primitive";

export function JsonTableCell({ value, emphasize }: { value: unknown; emphasize?: boolean }) {
  if (value === undefined) return <span className="text-muted/40">—</span>;
  // Nested values stay compact; selecting the cell shows them in full in the inspector.
  if (Array.isArray(value)) return <span className="font-mono text-xs text-muted/70">[{value.length}]</span>;
  if (isPlainObject(value)) {
    const n = Object.keys(value).length;
    return <span className="font-mono text-xs text-muted/70">{`{${n} ${n === 1 ? "item" : "items"}}`}</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className="inline-flex items-center gap-2 text-heading">
        <span aria-hidden className={`size-1.5 rounded-full ${value ? "bg-success" : "bg-muted/50"}`} />
        {String(value)}
      </span>
    );
  }
  if (typeof value === "string") return <span className={emphasize ? "font-semibold text-heading" : "text-muted"}>{value}</span>;
  return <JsonPrimitive value={value} />;
}
