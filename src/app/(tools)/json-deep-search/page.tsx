import { deepSearchTool } from "@/features/tools/deep-search/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(deepSearchTool);

export default function Page() {
  return <ToolPage tool={deepSearchTool} related={relatedTools(deepSearchTool)} />;
}
