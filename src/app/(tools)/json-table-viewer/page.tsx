import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { FormatterToolPage } from "@/features/tools/formatter/formatter-tool-page";
import { tableViewerTool } from "@/features/tools/table-viewer/meta";

export const metadata = toolMetadata(tableViewerTool);

export default function Page() {
  return <FormatterToolPage tool={tableViewerTool} related={relatedTools(tableViewerTool)} defaultView="table" />;
}
