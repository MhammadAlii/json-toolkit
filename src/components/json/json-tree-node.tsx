import { isPlainObject, samePath, type PathSegment } from "@/core/json/path";
import { JsonPrimitive } from "./json-primitive";
import { jsonTokenClasses } from "./json-token-classes";

export type TreeSelection = { selectedPath?: PathSegment[]; onSelect?: (path: PathSegment[]) => void };

type NodeProps = TreeSelection & { name?: PathSegment; value: unknown; path: PathSegment[]; rootLabel: string };

function rowClasses(selected: boolean, selectable: boolean) {
  return `flex items-center gap-1.5 rounded-md border px-2 py-1 ${
    selected ? "border-brand/30 bg-brand/10" : `border-transparent ${selectable ? "hover:bg-border/30" : ""}`
  } ${selectable ? "cursor-pointer" : ""}`;
}

export function JsonTreeNode({ name, value, path, rootLabel, selectedPath, onSelect }: NodeProps) {
  const selectable = !!onSelect;
  const selected = !!selectedPath && samePath(selectedPath, path);
  const isArray = Array.isArray(value);
  const label = name === undefined ? rootLabel : String(name);
  const keyClass = name === undefined ? "font-semibold text-brand" : typeof name === "number" ? "text-muted" : jsonTokenClasses.key;

  if (!isArray && !isPlainObject(value)) {
    return (
      <div
        role={selectable ? "button" : undefined}
        tabIndex={selectable ? 0 : undefined}
        aria-pressed={selectable ? selected : undefined}
        onClick={() => onSelect?.(path)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect?.(path))}
        className={`ml-5 ${rowClasses(selected, selectable)}`}
      >
        <span className={keyClass}>{label}</span>
        <span className={jsonTokenClasses.punct}>:</span>
        <JsonPrimitive value={value} />
      </div>
    );
  }

  const entries: [PathSegment, unknown][] = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);
  const count = isArray ? `[${entries.length}]` : `{${entries.length} ${entries.length === 1 ? "item" : "items"}}`;

  return (
    <details open={path.length < 2} className="group">
      <summary
        onClick={() => onSelect?.(path)}
        aria-current={selected ? "true" : undefined}
        className={`list-none [&::-webkit-details-marker]:hidden ${rowClasses(selected, true)}`}
      >
        <span aria-hidden className="inline-block w-3 text-center text-[10px] text-brand transition-transform group-open:rotate-90">
          ▶
        </span>
        <span className={keyClass}>{label}</span>
        <span className="text-xs text-muted/60">{count}</span>
      </summary>
      <div className="ml-4 border-l border-border/50 pl-1">
        {entries.map(([k, v]) => (
          <JsonTreeNode key={k} name={k} value={v} path={[...path, k]} rootLabel={rootLabel} selectedPath={selectedPath} onSelect={onSelect} />
        ))}
      </div>
    </details>
  );
}
