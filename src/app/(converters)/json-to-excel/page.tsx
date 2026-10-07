import { jsonToExcelTool } from "@/features/converters/json-to-excel/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(jsonToExcelTool);

export default function Page() {
  return <ToolPage tool={jsonToExcelTool} related={relatedTools(jsonToExcelTool)} />;
}
