import { ToolHeader } from "@/components/tool/tool-header";
import { ToolSeoContent } from "@/components/tool/tool-seo-content";
import { ToolStructuredData } from "@/components/tool/tool-structured-data";
import type { ToolMeta } from "@/core/tool/types";
import { AdSlot } from "@/features/ads/ad-slot";
import { FormatterToolWorkspace, type FormatterView } from "./formatter-tool-workspace";

// Shared by the Formatter, Tree Viewer and Table Viewer pages, which differ only in the opening view.
export function FormatterToolPage({ tool, related, defaultView }: { tool: ToolMeta; related: ToolMeta[]; defaultView?: FormatterView }) {
  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <ToolHeader tool={tool} aside={
          <div className="hidden w-[300px] shrink-0 lg:block">
            <AdSlot placement="hero" />
          </div>
        } />
      <FormatterToolWorkspace defaultView={defaultView} />
      <AdSlot placement="toolBelow" />
      <ToolSeoContent tool={tool} related={related} />
      <ToolStructuredData tool={tool} />
    </div>
  );
}
