import { jsonToCsvTool } from "@/features/converters/json-to-csv/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(jsonToCsvTool);

export default function Page() {
  return <ToolPage tool={jsonToCsvTool} related={relatedTools(jsonToCsvTool)} />;
}
