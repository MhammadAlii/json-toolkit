import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";
import { treeViewerTool } from "@/features/tools/tree-viewer/meta";

export const metadata = toolMetadata(treeViewerTool);

export default function Page() {
  return <ToolPage tool={treeViewerTool} related={relatedTools(treeViewerTool)} />;
}
