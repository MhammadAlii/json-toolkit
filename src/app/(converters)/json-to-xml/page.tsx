import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { jsonToXmlTool } from "@/features/converters/json-to-xml/meta";
import { JsonToXmlToolPage } from "@/features/converters/json-to-xml/json-to-xml-tool-page";

export const metadata = toolMetadata(jsonToXmlTool);

export default function Page() {
  return <JsonToXmlToolPage tool={jsonToXmlTool} related={relatedTools(jsonToXmlTool)} />;
}
