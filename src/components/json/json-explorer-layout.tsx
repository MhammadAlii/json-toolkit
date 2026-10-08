import { valueAtPath, type PathSegment } from "@/core/json/path";
import { JsonNodeInspector } from "./json-node-inspector";

// Output beside the node inspector; stacks when the container is narrow.
export function JsonExplorerLayout({
  value,
  selected,
  toolbar,
  children,
}: {
  value: unknown;
  selected: PathSegment[];
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  const current = valueAtPath(value, selected);
  const path = current === undefined ? [] : selected;

  return (
    <div className="@container h-full">
      <div className="flex h-full flex-col @xl:flex-row">
        <div className="@container/output flex min-h-0 min-w-0 flex-1 flex-col">
          {toolbar}
          <div className="min-h-0 flex-1 overflow-auto">{children}</div>
        </div>
        <div className="max-h-[50%] shrink-0 overflow-auto border-t border-border p-4 @xl:max-h-none @xl:w-[260px] @xl:border-t-0 @xl:border-l @xl:border-border/60 @4xl:w-[320px]">
          <JsonNodeInspector path={path} value={current === undefined ? value : current} />
        </div>
      </div>
    </div>
  );
}
