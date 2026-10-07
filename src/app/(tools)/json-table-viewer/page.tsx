import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";
import { tableViewerTool } from "@/features/tools/table-viewer/meta";

export const metadata = toolMetadata(tableViewerTool);

export default function Page() {
  return <ToolPage tool={tableViewerTool} related={relatedTools(tableViewerTool)} />;
}
