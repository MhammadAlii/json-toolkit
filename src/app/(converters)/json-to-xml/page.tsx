import { jsonToXmlTool } from "@/features/converters/json-to-xml/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(jsonToXmlTool);

export default function Page() {
  return <ToolPage tool={jsonToXmlTool} related={relatedTools(jsonToXmlTool)} />;
}
