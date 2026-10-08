import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { DiffWorkspace } from "./diff-workspace";

export function DiffToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <DiffWorkspace />
    </ToolLayout>
  );
}
