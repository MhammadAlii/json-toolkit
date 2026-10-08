import type { ToolMeta } from "@/core/tool/types";
import { ToolLayout } from "@/features/tools/shared/tool-layout";
import { FormatterWorkspace, type FormatterView } from "./formatter-workspace";

// Shared by the Formatter, Tree Viewer and Table Viewer pages, which differ only in the opening view.
export function FormatterToolPage({ tool, related, defaultView }: { tool: ToolMeta; related: ToolMeta[]; defaultView?: FormatterView }) {
  return (
    <ToolLayout tool={tool} related={related}>
      <FormatterWorkspace defaultView={defaultView} />
    </ToolLayout>
  );
}
