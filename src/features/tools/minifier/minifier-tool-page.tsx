import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { MinifierWorkspace } from "./minifier-workspace";

export function MinifierToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <MinifierWorkspace />
    </ToolLayout>
  );
}
