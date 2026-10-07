import { JsonTreeNode } from "./json-tree-node";

export function JsonTreeView({ value }: { value: unknown }) {
  return (
    <div className="p-4 font-mono text-sm leading-5">
      <JsonTreeNode value={value} />
    </div>
  );
}
