import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { Base64ConverterWorkspace } from "./base64-converter-workspace";

export function Base64ConverterToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <Base64ConverterWorkspace />
    </ToolLayout>
  );
}
