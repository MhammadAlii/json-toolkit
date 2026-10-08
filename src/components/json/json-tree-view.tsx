import { JsonTreeNode, type TreeSelection } from "./json-tree-node";

export function JsonTreeView({ value, rootLabel = "root", ...selection }: { value: unknown; rootLabel?: string } & TreeSelection) {
  return (
    <div className="p-4 font-mono text-sm leading-5">
      <JsonTreeNode value={value} path={[]} rootLabel={rootLabel} {...selection} />
    </div>
  );
}
