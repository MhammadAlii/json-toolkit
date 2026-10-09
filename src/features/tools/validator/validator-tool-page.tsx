import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { ValidatorWorkspace } from "./validator-workspace";

export function ValidatorToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <ValidatorWorkspace />
    </ToolLayout>
  );
}
