import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { JsonToTypeScriptWorkspace } from "./json-to-typescript-workspace";

export function JsonToTypeScriptToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <JsonToTypeScriptWorkspace />
    </ToolLayout>
  );
}
