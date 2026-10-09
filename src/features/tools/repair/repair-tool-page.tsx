import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { RepairWorkspace } from "./repair-workspace";

export function RepairToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <RepairWorkspace />
    </ToolLayout>
  );
}
