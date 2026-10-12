import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { UrlEncoderWorkspace } from "./url-encoder-workspace";

export function UrlEncoderToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <UrlEncoderWorkspace />
    </ToolLayout>
  );
}
