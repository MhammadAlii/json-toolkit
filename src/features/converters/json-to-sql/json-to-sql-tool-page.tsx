import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { JsonToSqlWorkspace } from "./json-to-sql-workspace";

export function JsonToSqlToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <JsonToSqlWorkspace />
    </ToolLayout>
  );
}
