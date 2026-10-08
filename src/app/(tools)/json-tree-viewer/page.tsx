import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { FormatterToolPage } from "@/features/tools/formatter/formatter-tool-page";
import { treeViewerTool } from "@/features/tools/tree-viewer/meta";

export const metadata = toolMetadata(treeViewerTool);

export default function Page() {
  return <FormatterToolPage tool={treeViewerTool} related={relatedTools(treeViewerTool)} defaultView="tree" />;
}
