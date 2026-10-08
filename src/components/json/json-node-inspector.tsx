import { describeSize, jsonKind } from "@/core/json/describe";
import { formatPath, type PathSegment } from "@/core/json/path";
import { InspectorField } from "./inspector-field";
import { JsonCodeView } from "./json-code-view";

const box = "truncate rounded-md border border-border bg-background px-2.5 py-2 font-mono text-xs leading-4";

export function JsonNodeInspector({ path, value, rootLabel = "root" }: { path: PathSegment[]; value: unknown; rootLabel?: string }) {
  return (
    <aside aria-label="Node inspector" className="flex flex-col gap-4 rounded-lg bg-surface-3 p-5">
      <h3 className="border-b border-border pb-3 text-xs leading-4 font-bold tracking-[0.6px] text-heading uppercase">Node Inspector</h3>
      <InspectorField label="Path">
        <span className={`${box} text-brand`} title={formatPath(path, rootLabel)}>
          {formatPath(path, rootLabel)}
        </span>
      </InspectorField>
      <div className="grid grid-cols-2 gap-3">
        <InspectorField label="Type">
          <span className={`${box} text-heading`}>{jsonKind(value)}</span>
        </InspectorField>
        <InspectorField label="Size">
          <span className={`${box} text-heading`}>{describeSize(value)}</span>
        </InspectorField>
      </div>
      <InspectorField label="Value">
        <div className="max-h-48 overflow-auto rounded-md border border-border bg-background [&_pre]:p-3 [&_pre]:text-xs">
          <JsonCodeView text={JSON.stringify(value, null, 2) ?? "undefined"} lineNumbers={false} />
        </div>
      </InspectorField>
    </aside>
  );
}
