import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { EpochConverterWorkspace } from "./epoch-converter-workspace";

export function EpochConverterToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <EpochConverterWorkspace />
    </ToolLayout>
  );
}
