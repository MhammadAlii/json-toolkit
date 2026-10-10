import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { JsonToXmlWorkspace } from "./json-to-xml-workspace";

export function JsonToXmlToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <JsonToXmlWorkspace />
    </ToolLayout>
  );
}
