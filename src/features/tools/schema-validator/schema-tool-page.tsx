import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { SchemaWorkspace } from "./schema-workspace";

export function SchemaToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <SchemaWorkspace />
    </ToolLayout>
  );
}
