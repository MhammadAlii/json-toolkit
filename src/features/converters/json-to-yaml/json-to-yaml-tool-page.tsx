import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { JsonToYamlWorkspace } from "./json-to-yaml-workspace";

export function JsonToYamlToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <JsonToYamlWorkspace />
    </ToolLayout>
  );
}
