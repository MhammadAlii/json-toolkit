import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { JsonToCsvWorkspace } from "./json-to-csv-workspace";

export function JsonToCsvToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <JsonToCsvWorkspace />
    </ToolLayout>
  );
}
