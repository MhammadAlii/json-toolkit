import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { jsonToExcelTool } from "@/features/converters/json-to-excel/meta";
import { JsonToExcelToolPage } from "@/features/converters/json-to-excel/json-to-excel-tool-page";

export const metadata = toolMetadata(jsonToExcelTool);

export default function Page() {
  return <JsonToExcelToolPage tool={jsonToExcelTool} related={relatedTools(jsonToExcelTool)} />;
}
