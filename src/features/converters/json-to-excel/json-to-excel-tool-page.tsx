import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { JsonToExcelWorkspace } from "./json-to-excel-workspace";

export function JsonToExcelToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <JsonToExcelWorkspace />
    </ToolLayout>
  );
}
