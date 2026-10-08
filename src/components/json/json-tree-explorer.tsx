"use client";

import { useState } from "react";
import type { PathSegment } from "@/core/json/path";
import { JsonExplorerLayout } from "./json-explorer-layout";
import { JsonTreeView } from "./json-tree-view";

// Tree with a selectable node and an inspector beside it.
export function JsonTreeExplorer({ value }: { value: unknown }) {
  const [selected, setSelected] = useState<PathSegment[]>([]);

  return (
    <JsonExplorerLayout value={value} selected={selected}>
      <JsonTreeView value={value} selectedPath={selected} onSelect={setSelected} />
    </JsonExplorerLayout>
  );
}
