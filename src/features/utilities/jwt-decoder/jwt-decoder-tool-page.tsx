import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { JwtDecoderWorkspace } from "./jwt-decoder-workspace";

export function JwtDecoderToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <JwtDecoderWorkspace />
    </ToolLayout>
  );
}
