import { ComingSoon } from "@/components/ui/coming-soon";
import type { ToolMeta } from "@/core/tool/types";
import { ToolStructuredData } from "./tool-structured-data";

// TODO: replace the placeholder with the tool page design; each tool's UI lives in its <tool>-tool.tsx.
export function ToolPage({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <>
      <ComingSoon title={tool.h1} description={tool.intro} links={related.map((t) => ({ label: t.name, href: `/${t.slug}` }))} />
      <ToolStructuredData tool={tool} />
    </>
  );
}
