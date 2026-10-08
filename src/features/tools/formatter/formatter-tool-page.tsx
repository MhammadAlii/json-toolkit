import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { FormatterWorkspace, type FormatterView } from "./formatter-workspace";

// Shared by the Formatter, Tree Viewer and Table Viewer pages; the viewers pin the output to their view.
export function FormatterToolPage({ tool, related, lockedView }: { tool: ToolMeta; related: ToolMeta[]; lockedView?: FormatterView }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <FormatterWorkspace lockedView={lockedView} />
    </ToolLayout>
  );
}
