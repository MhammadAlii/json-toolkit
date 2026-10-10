import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { DeepSearchWorkspace } from "./deep-search-workspace";

export function DeepSearchToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <DeepSearchWorkspace />
    </ToolLayout>
  );
}
