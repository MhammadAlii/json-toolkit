import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { deepSearchTool } from "@/features/tools/deep-search/meta";
import { DeepSearchToolPage } from "@/features/tools/deep-search/deep-search-tool-page";

export const metadata = toolMetadata(deepSearchTool);

export default function Page() {
  return <DeepSearchToolPage tool={deepSearchTool} related={relatedTools(deepSearchTool)} />;
}
