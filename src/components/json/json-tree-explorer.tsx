"use client";

import { useState } from "react";
import { valueAtPath, type PathSegment } from "@/core/json/path";
import { JsonNodeInspector } from "./json-node-inspector";
import { JsonTreeView } from "./json-tree-view";

// Tree with a selectable node and an inspector beside it.
export function JsonTreeExplorer({ value }: { value: unknown }) {
  const [selected, setSelected] = useState<PathSegment[]>([]);
  const current = valueAtPath(value, selected);
  const path = current === undefined ? [] : selected;

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <div className="min-w-0 flex-1 overflow-auto">
        <JsonTreeView value={value} selectedPath={path} onSelect={setSelected} />
      </div>
      <div className="shrink-0 border-t border-border p-4 md:w-[320px] md:border-t-0 md:border-l md:border-border/60">
        <JsonNodeInspector path={path} value={current === undefined ? value : current} />
      </div>
    </div>
  );
}
