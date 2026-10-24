import { ToolHeader } from "@/components/tool/tool-header";
import { ToolSeoContent } from "@/components/tool/tool-seo-content";
import { ToolStructuredData } from "@/components/tool/tool-structured-data";
import type { ToolMeta } from "@/core/tool/types";
import { AdSlot } from "@/features/ads/ad-slot";

// Frame shared by every implemented tool page: header with an ad, the workspace, then SEO content.
export function ToolLayout({ tool, related, children }: { tool: ToolMeta; related: ToolMeta[]; children: React.ReactNode }) {
  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <ToolHeader
        tool={tool}
        aside={
          <div className="ad-frame relative hidden w-[300px] shrink-0 self-stretch lg:block">
            <AdSlot placement="hero" className="absolute inset-0" />
          </div>
        }
      />
      {children}
      <AdSlot placement="toolBelow" />
      <ToolSeoContent tool={tool} related={related} />
      <ToolStructuredData tool={tool} />
    </div>
  );
}
